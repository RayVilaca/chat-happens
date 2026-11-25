# Textos para as lojas (Edge Add-ons, Firefox AMO, Chrome Web Store)

Copie e cole nos campos de cada loja. Todas aceitam descrição por idioma.

**Política de privacidade (URL):** https://github.com/RayVilaca/chat-happens/blob/main/PRIVACY.md
**Site / suporte:** https://github.com/RayVilaca/chat-happens
**Categoria:** Produtividade / Productivity
**Licença (Firefox pede):** MIT

---

## Português (pt-BR)

**Nome:** ChatHappens – Apague chats do ChatGPT em massa

**Resumo curto (até 132 caracteres):**
Selecione e apague (ou arquive) vários chats do ChatGPT de uma vez. Filtro por título, Shift+clique e selecionar todos.

**Descrição:**
Chat happens. Move on.

Cansou de apagar conversas do ChatGPT uma por uma? O ChatHappens adiciona um painel ao ChatGPT onde você seleciona vários chats e apaga ou arquiva todos de uma vez.

Recursos:
• Apagar vários chats de uma vez
• Arquivar e desarquivar em massa
• Filtrar chats pelo título
• Shift + clique para selecionar um intervalo
• Selecionar todos os chats visíveis
• Interface em português, inglês e espanhol

Privacidade:
A extensão roda inteiramente no seu navegador, usando a sua própria sessão do ChatGPT. Nenhum dado é coletado ou enviado a terceiros. Código aberto: https://github.com/RayVilaca/chat-happens

Projeto independente, sem afiliação com a OpenAI. "ChatGPT" é uma marca da OpenAI.

---

## English (en)

**Name:** ChatHappens – Bulk delete ChatGPT chats

**Short summary (max 132 chars):**
Select and delete (or archive) multiple ChatGPT chats at once. Filter by title, Shift+click ranges and select all.

**Description:**
Chat happens. Move on.

Tired of deleting ChatGPT conversations one by one? ChatHappens adds a panel to ChatGPT where you select multiple chats and delete or archive them all at once.

Features:
• Delete multiple chats at once
• Bulk archive and unarchive
• Filter chats by title
• Shift + click to select a range
• Select all visible chats
• Interface in English, Portuguese and Spanish

Privacy:
The extension runs entirely in your browser using your own ChatGPT session. No data is collected or sent to third parties. Open source: https://github.com/RayVilaca/chat-happens

Independent project, not affiliated with OpenAI. "ChatGPT" is a trademark of OpenAI.

---

## Español (es)

**Nombre:** ChatHappens – Borra chats de ChatGPT en masa

**Resumen corto (máx. 132 caracteres):**
Selecciona y borra (o archiva) varios chats de ChatGPT a la vez. Filtro por título, Mayús+clic y seleccionar todos.

**Descripción:**
Chat happens. Move on.

¿Cansado de borrar conversaciones de ChatGPT una por una? ChatHappens añade un panel a ChatGPT donde seleccionas varios chats y los borras o archivas todos a la vez.

Funciones:
• Borrar varios chats a la vez
• Archivar y desarchivar en masa
• Filtrar chats por título
• Mayús + clic para seleccionar un rango
• Seleccionar todos los chats visibles
• Interfaz en español, portugués e inglés

Privacidad:
La extensión funciona completamente en tu navegador con tu propia sesión de ChatGPT. No se recopilan ni se envían datos a terceros. Código abierto: https://github.com/RayVilaca/chat-happens

Proyecto independiente, sin afiliación con OpenAI. "ChatGPT" es una marca de OpenAI.

---

## Justificativa das permissões (campo pedido na revisão)

**activeTab:** Used only when the user clicks the toolbar icon, to check whether the current tab is ChatGPT and open the panel there.

**Host permissions (chatgpt.com, chat.openai.com):** Needed to inject the panel into ChatGPT and call ChatGPT's own API, with the user's existing session, to list, delete and archive their chats. No other sites are accessed.

**Remote code:** No. All code is included in the package.

**Data usage:** No user data is collected, stored or transmitted to the developer or third parties.

---

## Notas para o revisor do Firefox (campo "Notes to reviewer")

No build step. The source in the package is the original, unminified code. To test: log in to chatgpt.com, click the floating 🗑 button at the bottom right, select chats, then click Delete or Archive.

---

## Imagens

- **Ícone:** `icons/icon128.png`
- **Capturas de tela:** 1280×800 ou 640×400 (PNG/JPG). Tire do painel aberto no ChatGPT, de preferência com chats de exemplo e sem conversas pessoais visíveis.
- **Evite o logo da OpenAI** nas imagens da loja. É um motivo comum de rejeição por uso de marca.
