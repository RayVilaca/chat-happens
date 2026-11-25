// ChatHappens — content script
// Usa a API interna do ChatGPT (a mesma que o site usa) com a sua sessão logada.
(() => {
  if (window.__cgbdLoaded) return;
  window.__cgbdLoaded = true;

  // Tradução: chrome.i18n escolhe pt_BR / en / es conforme o idioma do navegador.
  // Os textos ficam em _locales/<idioma>/messages.json; {1}, {2}… são substituídos pelos args.
  const t = (key, ...args) =>
    args.reduce((s, v, i) => s.split(`{${i + 1}}`).join(String(v)), chrome.i18n.getMessage(key) || key);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const PAGE_SIZE = 100;
  const DELAY_MS = 350; // pausa entre requisições para evitar rate limit (429)

  // ---------------------------------------------------------------- API
  let tokenCache = null;

  async function getToken() {
    if (tokenCache) return tokenCache;
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) throw new Error(t("errSession"));
    const data = await res.json();
    if (!data.accessToken) throw new Error(t("errNoToken"));
    tokenCache = data.accessToken;
    return tokenCache;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function api(path, { method = "GET", body } = {}, attempt = 0) {
    const token = await getToken();
    const res = await fetch(`/backend-api${path}`, {
      method,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429 && attempt < 5) {
      const wait = 2000 * 2 ** attempt;
      setStatus(t("rateLimit", wait / 1000));
      await sleep(wait);
      return api(path, { method, body }, attempt + 1);
    }
    if (res.status === 401 && attempt === 0) {
      tokenCache = null;
      return api(path, { method, body }, attempt + 1);
    }
    if (!res.ok) throw new Error(t("errHttp", res.status, `${method} ${path}`));
    return res.json().catch(() => ({}));
  }

  async function fetchAllConversations(archived, onProgress) {
    const all = [];
    let offset = 0;
    while (true) {
      const q = `offset=${offset}&limit=${PAGE_SIZE}&order=updated` + (archived ? "&is_archived=true" : "");
      const data = await api(`/conversations?${q}`);
      const items = data.items || [];
      all.push(...items);
      onProgress?.(all.length, data.total);
      if (items.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
      await sleep(150);
    }
    return all;
  }

  const deleteConversation = (id) => api(`/conversation/${id}`, { method: "PATCH", body: { is_visible: false } });
  const setArchived = (id, value) => api(`/conversation/${id}`, { method: "PATCH", body: { is_archived: value } });

  // ---------------------------------------------------------------- UI
  const host = document.createElement("div");
  host.id = "cgbd-host";
  const root = host.attachShadow({ mode: "open" });
  // O ChatGPT redesenha a página e pode remover elementos externos: recoloca o painel se sumir.
  const mount = () => {
    if (!host.isConnected) (document.body || document.documentElement).appendChild(host);
  };
  mount();
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  console.log("[ChatHappens] carregado");

  root.innerHTML = `
    <style>
      :host {
        all: initial;
        --primary: #6B5CF6; --secondary: #A855F7; --bg: #0B0914; --surface: #2A243C;
        --text: #E5E7EB; --accent: #C4B5FD; --muted: #9a93b3; --line: #221d33;
        --grad: linear-gradient(135deg, var(--primary), var(--secondary));
      }
      * { box-sizing: border-box; font-family: Poppins, Inter, system-ui, -apple-system, "Segoe UI", sans-serif; }
      .fab {
        position: fixed; right: 20px; bottom: 90px; z-index: 2147483646;
        width: 48px; height: 48px; border-radius: 14px; border: none; cursor: pointer;
        background: var(--grad); color: #fff; font-size: 20px;
        box-shadow: 0 6px 20px rgba(107,92,246,.45); transition: transform .15s, box-shadow .15s;
      }
      .fab:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(168,85,247,.6); }
      .overlay {
        position: fixed; inset: 0; z-index: 2147483647; background: rgba(11,9,20,.7); backdrop-filter: blur(3px);
        display: none; align-items: center; justify-content: center;
      }
      .overlay.open { display: flex; }
      .panel {
        width: min(680px, calc(100vw - 32px)); height: min(80vh, 760px);
        background: var(--bg); color: var(--text); border-radius: 18px; display: flex; flex-direction: column;
        border: 1px solid var(--surface); box-shadow: 0 20px 60px rgba(107,92,246,.25); overflow: hidden; font-size: 14px;
      }
      header {
        padding: 16px 18px; display: flex; align-items: center; gap: 8px;
        background: linear-gradient(120deg, #1a1430 0%, var(--bg) 60%, #241a45 100%); border-bottom: 1px solid var(--line);
      }
      .brand { flex: 1; }
      .brand h2 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -.3px; color: #fff; }
      .brand h2 span { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .brand p { margin: 2px 0 0; font-size: 12px; font-style: italic; color: var(--accent); }
      .x { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; }
      .x:hover { color: var(--text); }
      .toolbar { padding: 12px 18px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; border-bottom: 1px solid var(--line); }
      input[type=search], select {
        background: var(--surface); border: 1px solid transparent; color: var(--text); border-radius: 10px; padding: 8px 12px; font-size: 13px; outline: none;
      }
      input[type=search]:focus, select:focus { border-color: var(--primary); }
      input[type=search]::placeholder { color: var(--muted); }
      input[type=search] { flex: 1; min-width: 160px; }
      .list { flex: 1; overflow-y: auto; scrollbar-color: var(--surface) transparent; }
      .row { display: flex; gap: 12px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--line); cursor: pointer; user-select: none; }
      .row:hover { background: #15111f; }
      .row.sel { background: rgba(107,92,246,.16); }
      .row .t { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .row .d { color: var(--muted); font-size: 12px; white-space: nowrap; }
      input[type=checkbox] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
      footer { padding: 12px 18px; border-top: 1px solid var(--line); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .status { flex: 1; color: var(--muted); font-size: 12px; min-width: 150px; }
      button.b { border: none; border-radius: 10px; padding: 9px 16px; cursor: pointer; font-size: 13px; font-weight: 600; transition: filter .15s; }
      button.b:hover:not(:disabled) { filter: brightness(1.12); }
      button.b:disabled { opacity: .4; cursor: not-allowed; }
      .danger { background: var(--grad); color: #fff; }
      .neutral { background: var(--surface); color: var(--text); }
      .progress { height: 3px; background: var(--line); }
      .progress > div { height: 100%; width: 0; background: var(--grad); transition: width .2s; }
      .empty { padding: 40px; text-align: center; color: var(--muted); }
      label.all { display: flex; gap: 6px; align-items: center; cursor: pointer; font-size: 13px; }
    </style>
    <button class="fab" title="${esc(t("fabTitle"))}">🗑</button>
    <div class="overlay">
      <div class="panel">
        <header>
          <div class="brand"><h2>Chat<span>Happens</span></h2><p>Chat happens. Move on.</p></div>
          <button class="x" title="${esc(t("close"))}">✕</button>
        </header>
        <div class="toolbar">
          <label class="all"><input type="checkbox" class="selall"> ${esc(t("all"))}</label>
          <input type="search" class="q" placeholder="${esc(t("filter"))}">
          <select class="src">
            <option value="active">${esc(t("srcActive"))}</option>
            <option value="archived">${esc(t("srcArchived"))}</option>
          </select>
          <button class="b neutral reload" title="${esc(t("reloadList"))}">↻</button>
        </div>
        <div class="progress"><div></div></div>
        <div class="list"><div class="empty">${esc(t("loading"))}</div></div>
        <footer>
          <span class="status"></span>
          <button class="b neutral archive" disabled>${esc(t("archive"))}</button>
          <button class="b danger delete" disabled>${esc(t("delete"))}</button>
          <button class="b neutral finish" hidden>${esc(t("finish"))}</button>
        </footer>
      </div>
    </div>
  `;

  const $ = (s) => root.querySelector(s);
  const overlay = $(".overlay");
  const listEl = $(".list");
  const statusEl = $(".status");
  const barEl = $(".progress > div");
  const qEl = $(".q");
  const srcEl = $(".src");
  const selAllEl = $(".selall");
  const btnDelete = $(".delete");
  const btnArchive = $(".archive");
  const btnFinish = $(".finish");

  let conversations = [];
  const selected = new Set();
  let lastClickedIndex = null;
  let busy = false;
  let loaded = false;

  function setStatus(t) { statusEl.textContent = t; }
  function setProgress(done, total) { barEl.style.width = total ? `${(done / total) * 100}%` : "0"; }

  function visible() {
    const q = qEl.value.trim().toLowerCase();
    return q ? conversations.filter((c) => (c.title || "").toLowerCase().includes(q)) : conversations;
  }

  function fmtDate(s) {
    if (!s) return "";
    const d = new Date(typeof s === "number" ? s * 1000 : s);
    return d.toLocaleDateString(chrome.i18n.getUILanguage(), { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function render() {
    const items = visible();
    if (!items.length) {
      listEl.innerHTML = `<div class="empty">${esc(loaded ? t("noChats") : t("loading"))}</div>`;
    } else {
      const frag = document.createDocumentFragment();
      items.forEach((c, i) => {
        const row = document.createElement("div");
        row.className = "row" + (selected.has(c.id) ? " sel" : "");
        row.dataset.index = i;
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.has(c.id);
        const title = document.createElement("span");
        title.className = "t";
        title.textContent = c.title || t("untitled");
        title.title = c.title || "";
        const d = document.createElement("span");
        d.className = "d";
        d.textContent = fmtDate(c.update_time || c.create_time);
        row.append(cb, title, d);
        frag.appendChild(row);
      });
      listEl.replaceChildren(frag);
    }
    updateFooter();
  }

  function updateFooter() {
    const items = visible();
    const n = selected.size;
    btnDelete.disabled = busy || n === 0;
    btnArchive.disabled = busy || n === 0;
    btnFinish.disabled = busy;
    btnArchive.textContent = srcEl.value === "archived" ? t("unarchive") : t("archive");
    btnDelete.textContent = n ? t("deleteN", n) : t("delete");
    selAllEl.checked = items.length > 0 && items.every((c) => selected.has(c.id));
    if (!busy) setStatus(t("statusCount", conversations.length, n) + (n ? "" : t("shiftHint")));
  }

  listEl.addEventListener("click", (e) => {
    const row = e.target.closest(".row");
    if (!row || busy) return;
    const idx = Number(row.dataset.index);
    const items = visible();
    const id = items[idx].id;
    const willSelect = !selected.has(id);

    if (e.shiftKey && lastClickedIndex !== null) {
      const [a, b] = [Math.min(lastClickedIndex, idx), Math.max(lastClickedIndex, idx)];
      for (let i = a; i <= b; i++) willSelect ? selected.add(items[i].id) : selected.delete(items[i].id);
    } else {
      willSelect ? selected.add(id) : selected.delete(id);
    }
    lastClickedIndex = idx;
    render();
  });

  selAllEl.addEventListener("change", () => {
    const items = visible();
    items.forEach((c) => (selAllEl.checked ? selected.add(c.id) : selected.delete(c.id)));
    render();
  });

  qEl.addEventListener("input", () => { lastClickedIndex = null; render(); });
  srcEl.addEventListener("change", () => load());
  $(".reload").addEventListener("click", () => load());

  async function load() {
    if (busy) return;
    busy = true;
    loaded = false;
    selected.clear();
    lastClickedIndex = null;
    conversations = [];
    render();
    try {
      conversations = await fetchAllConversations(srcEl.value === "archived", (n, total) => {
        setStatus(total ? t("loadingNofT", n, total) : t("loadingN", n));
        setProgress(n, total || n);
      });
      loaded = true;
    } catch (err) {
      setStatus(t("error", err.message));
      loaded = true;
    } finally {
      busy = false;
      setProgress(0, 0);
      render();
    }
  }

  async function runBatch(label, fn) {
    const ids = [...selected];
    busy = true;
    updateFooter();
    let ok = 0, fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setStatus(t("progressOf", label, i + 1, ids.length));
      setProgress(i, ids.length);
      try {
        await fn(ids[i]);
        ok++;
        selected.delete(ids[i]);
        conversations = conversations.filter((c) => c.id !== ids[i]);
      } catch (err) {
        console.error("[ChatHappens]", err);
        fail++;
      }
      await sleep(DELAY_MS);
    }
    busy = false;
    setProgress(0, 0);
    render();
    // A barra lateral do ChatGPT só reflete as mudanças após recarregar a página.
    if (ok) btnFinish.hidden = false;
    setStatus(fail ? t("doneFail", ok, fail) : t("done", ok));
  }

  btnDelete.addEventListener("click", () => {
    const n = selected.size;
    if (!n) return;
    if (!confirm(t("confirmDelete", n))) return;
    runBatch(t("deleting"), deleteConversation);
  });

  btnArchive.addEventListener("click", () => {
    const unarchive = srcEl.value === "archived";
    runBatch(unarchive ? t("unarchiving") : t("archiving"), (id) => setArchived(id, !unarchive));
  });

  btnFinish.addEventListener("click", () => { overlay.classList.remove("open"); location.reload(); });

  function open() {
    overlay.classList.add("open");
    if (!loaded && !busy) load();
  }
  function close() {
    if (busy) return;
    overlay.classList.remove("open");
  }

  $(".fab").addEventListener("click", open);
  $(".x").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "cgbd-open") { open(); sendResponse({ ok: true }); }
  });
})();
