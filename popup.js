document.documentElement.lang = chrome.i18n.getUILanguage();
document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = chrome.i18n.getMessage(el.dataset.i18n); });

const btn = document.getElementById("go");
const msg = document.getElementById("msg");
const CHATGPT_URL = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//;

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Fora do ChatGPT: não abre o painel, só avisa e oferece um atalho para o site.
  if (!(tab?.url && CHATGPT_URL.test(tab.url))) {
    msg.textContent = chrome.i18n.getMessage("popupNotChatGPT");
    btn.textContent = chrome.i18n.getMessage("popupGoChatGPT");
    btn.addEventListener("click", async () => {
      await chrome.tabs.create({ url: "https://chatgpt.com/" });
      window.close();
    });
    return;
  }

  btn.addEventListener("click", async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "cgbd-open" });
      window.close();
    } catch {
      msg.textContent = chrome.i18n.getMessage("popupReload");
    }
  });
})();
