<p align="center">
  <img src="assets/banner.png" alt="ChatHappens — Apague conversas do ChatGPT com um clique." width="100%">
</p>

<p align="center">
  <b>Português</b> · <a href="#english">English</a> · <a href="#español">Español</a>
</p>

# ChatHappens

> *Chat happens. Move on.*

Extensão para Chrome que permite **selecionar e apagar (ou arquivar) vários chats do ChatGPT de uma vez**, sem precisar abrir um por um.

## Funcionalidades

- 🗑️ Apagar vários chats de uma vez
- 📦 Arquivar e desarquivar em massa
- 🔍 Filtrar chats pelo título
- ⇧ **Shift + clique** para selecionar um intervalo
- ☑️ Selecionar todos os chats visíveis
- 🌎 Interface em **português, inglês e espanhol** (segue o idioma do navegador)
- 🔒 Roda 100% no seu navegador, usando a sua própria sessão do ChatGPT. Nenhum dado é enviado a terceiros. ([Política de privacidade](PRIVACY.md))

## Instalação (modo desenvolvedor)

1. Baixe este repositório (**Code → Download ZIP**) e extraia, ou clone:
   ```bash
   git clone https://github.com/RayVilaca/chat-happens.git
   ```
2. Abra `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e selecione a pasta `chat-happens`.

## Como usar

1. Abra o [chatgpt.com](https://chatgpt.com) e faça login.
2. Clique no botão flutuante 🗑 no canto da página, ou no ícone da extensão → **Abrir painel**.
3. Selecione os chats, escolha **Apagar** ou **Arquivar**.
4. Ao terminar, clique em **Concluído** para recarregar a página e atualizar a barra lateral.

> ⚠️ Chats apagados não podem ser recuperados.

## Como funciona

A extensão usa a mesma API interna que o site do ChatGPT usa, com a sessão já logada no navegador. Há uma pausa entre as requisições e novas tentativas automáticas em caso de limite de requisições (HTTP 429).

Como essa API não é pública, mudanças feitas pela OpenAI podem quebrar a extensão até que ela seja atualizada.

## Estrutura

```
manifest.json      # Manifest V3
content.js         # Painel injetado no ChatGPT + chamadas à API
popup.html/.js     # Popup do ícone da extensão
_locales/          # Traduções (pt_BR, en, es)
icons/             # Ícones da extensão
```

---

<a id="english"></a>
## English

**ChatHappens** is a Chrome extension to **select and delete (or archive) multiple ChatGPT chats at once**.

- Bulk delete, archive and unarchive
- Filter by title, Shift+click range selection, select all
- UI in Portuguese, English and Spanish (follows the browser language)
- Runs entirely in your browser with your own ChatGPT session. No data is sent to third parties.

**Install:** clone or download this repo → open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the folder.
**Use:** open chatgpt.com, click the floating 🗑 button, select chats, delete or archive, then click **Done** to reload the page.

---

<a id="español"></a>
## Español

**ChatHappens** es una extensión de Chrome para **seleccionar y borrar (o archivar) varios chats de ChatGPT a la vez**.

- Borrar, archivar y desarchivar en masa
- Filtrar por título, Mayús+clic para seleccionar un rango, seleccionar todos
- Interfaz en portugués, inglés y español (sigue el idioma del navegador)
- Funciona solo en tu navegador con tu propia sesión de ChatGPT. No se envían datos a terceros.

**Instalar:** clona o descarga este repo → abre `chrome://extensions` → activa el **Modo de desarrollador** → **Cargar descomprimida** → selecciona la carpeta.
**Usar:** abre chatgpt.com, haz clic en el botón flotante 🗑, selecciona los chats, bórralos o archívalos y haz clic en **Listo** para recargar la página.

---

## Aviso

Projeto independente, sem qualquer afiliação com a OpenAI. "ChatGPT" é uma marca da OpenAI.
*Independent project, not affiliated with OpenAI.*

## Licença

[MIT](LICENSE) © Rayssa Vilaça
