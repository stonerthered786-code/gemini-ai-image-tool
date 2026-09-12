// ==UserScript==
// @name         OmniImage - Multi-AI Image Generator
// @namespace    https://github.com/stonerthered786-code/gemini-ai-image-tool
// @version      2.1
// @description  Multi-provider AI image generation (Gemini, DALL-E, Midjourney, Stable Diffusion)
// @author       stonerthered786
// @match        *://*/*
// @exclude      https://jathara.thecircleapp.in/*/create-layout*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/stonerthered786-code/gemini-ai-image-tool/main/gemini-ai-image-tool.user.js
// @downloadURL  https://raw.githubusercontent.com/stonerthered786-code/gemini-ai-image-tool/main/gemini-ai-image-tool.user.js
// ==/UserScript==

(function () {

'use strict';

const MIN_SIZE = 200;

//////////////////////////////////////////////////
// PROVIDER CONFIGURATION
//////////////////////////////////////////////////

const PROVIDERS = {
  gemini: {
    name: "Gemini (Google)",
    url: "https://gemini.google.com/app",
    icon: "🤖",
    color: "#1a73e8",
    hasAutomation: true,
    free: true,
    prompt: `Transform the input image into a professional political-style portrait while preserving the original photo composition.
Important preservation rules:

Keep the exact same framing and crop.
Keep the same clothing exactly as in the original image.
Do NOT change the outfit or add a suit.
Preserve the person's identity and facial structure.
Framing:

Square 1:1 image
Face height about 55–60%
Include head, neck, and upper shoulders
Centered composition
Pose:

Facing forward
Neutral, calm, confident expression
Eyes looking directly at the camera
Style:

Professional official portrait style similar to government profile photos
Clean, dignified, authoritative appearance
Natural and realistic look (not stylized)
Background:

Plain light gray or soft neutral background
Smooth and distraction-free
Lighting:

Soft professional studio lighting
Even lighting on the face
Slight portrait contrast for a formal look
Quality:

High-resolution professional portrait
Enhance clarity and sharpness
Maintain natural skin tones
Preserve identity accurately`
  },
  bing: {
    name: "Bing Image Creator",
    url: "https://www.bing.com/images/create",
    icon: "🎯",
    color: "#00a4ef",
    hasAutomation: false,
    free: true,
    prompt: `Professional political-style portrait photo. Transform image into official government portrait. Keep exact framing, same clothing, preserve identity. Studio lighting, neutral gray background, formal dignified appearance.`
  },
  craiyon: {
    name: "Craiyon",
    url: "https://www.craiyon.com",
    icon: "🎨",
    color: "#aa2e4c",
    hasAutomation: false,
    free: true,
    prompt: `professional political portrait, formal, dignified, studio lighting, neutral background, high quality, preserve clothing and identity`
  },
  huggingface: {
    name: "Hugging Face",
    url: "https://huggingface.co/spaces",
    icon: "🤗",
    color: "#ffd21e",
    hasAutomation: false,
    free: true,
    prompt: `professional portrait, political style, formal, dignified, studio lighting, neutral background, high resolution, preserve original clothing and identity`
  },
  leonardo: {
    name: "Leonardo.AI",
    url: "https://leonardo.ai",
    icon: "✨",
    color: "#00d4ff",
    hasAutomation: false,
    free: true,
    prompt: `professional political-style portrait, formal government official photo, studio lighting, neutral background, high resolution, preserve identity and clothing`
  }
};

// Store user's last selected provider
const getLastProvider = () => GM_getValue("lastProvider", "gemini");
const setLastProvider = (provider) => GM_setValue("lastProvider", provider);

const PROMPT = PROVIDERS.gemini.prompt;

//////////////////////////////////////////////////
// IMAGE BUTTON & PROVIDER SELECTOR
//////////////////////////////////////////////////

if(!location.hostname.includes("gemini.google.com")){

function createProviderMenu(img, wrapper) {
  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.top = "40px";
  menu.style.right = "6px";
  menu.style.background = "white";
  menu.style.border = "1px solid #ddd";
  menu.style.borderRadius = "8px";
  menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  menu.style.zIndex = "10000";
  menu.style.minWidth = "200px";
  menu.style.display = "none";
  menu.style.overflow = "hidden";

  Object.entries(PROVIDERS).forEach(([key, provider]) => {
    const option = document.createElement("button");
    option.innerText = `${provider.icon} ${provider.name}`;
    option.style.width = "100%";
    option.style.padding = "10px 12px";
    option.style.border = "none";
    option.style.background = "transparent";
    option.style.cursor = "pointer";
    option.style.textAlign = "left";
    option.style.fontSize = "13px";
    option.style.transition = "background 0.2s";
    option.style.color = "#333";

    option.addEventListener("mouseenter", () => {
      option.style.background = provider.color + "15";
    });
    option.addEventListener("mouseleave", () => {
      option.style.background = "transparent";
    });

    option.onclick = async () => {
      setLastProvider(key);
      menu.style.display = "none";
      handleImageSend(img, key);
    };

    menu.appendChild(option);
  });

  return menu;
}

function handleImageSend(img, providerKey) {
  const provider = PROVIDERS[providerKey];

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(async blob => {
    const item = new ClipboardItem({"image/png": blob});
    await navigator.clipboard.write([item]);

    // Show notification
    showNotification(`Image copied! Opening ${provider.name}...`);

    // Open provider URL
    setTimeout(() => {
      window.open(provider.url, "_blank");
    }, 500);
  });
}

function showNotification(message) {
  const notif = document.createElement("div");
  notif.innerText = message;
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.background = "#1a73e8";
  notif.style.color = "white";
  notif.style.padding = "12px 16px";
  notif.style.borderRadius = "6px";
  notif.style.zIndex = "10001";
  notif.style.fontSize = "13px";
  notif.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

function addButton(img) {
  if(img.dataset.aiAttached) return;
  img.dataset.aiAttached = true;

  if(img.naturalWidth < MIN_SIZE) return;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";

  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);

  const btn = document.createElement("button");
  btn.innerText = "AI ⚡";

  btn.style.position = "absolute";
  btn.style.top = "6px";
  btn.style.right = "6px";
  btn.style.zIndex = "9999";
  btn.style.padding = "4px 8px";
  btn.style.background = "#1a73e8";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.borderRadius = "6px";
  btn.style.opacity = "0";
  btn.style.transition = "opacity 0.2s";
  btn.style.fontSize = "12px";
  btn.style.fontWeight = "bold";

  wrapper.appendChild(btn);

  // Create provider menu
  const menu = createProviderMenu(img, wrapper);
  wrapper.appendChild(menu);

  wrapper.addEventListener("mouseenter", () => {
    btn.style.opacity = "1";
  });

  wrapper.addEventListener("mouseleave", () => {
    btn.style.opacity = "0";
    menu.style.display = "none";
  });

  btn.onclick = (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  };
}

function scan(){
  document.querySelectorAll("img").forEach(img => {
    if(img.complete){
      addButton(img);
    } else {
      img.onload = () => addButton(img);
    }
  });
}

scan();

new MutationObserver(scan)
  .observe(document.body, {childList: true, subtree: true});

}

//////////////////////////////////////////////////
// GEMINI AUTOMATION (Auto-fill prompt)
//////////////////////////////////////////////////

if(location.hostname.includes("gemini.google.com")){

setTimeout(() => {
  const editor =
    document.querySelector("textarea") ||
    document.querySelector('[contenteditable="true"]');

  if(!editor) return;

  editor.focus();

  const geminiPrompt = PROVIDERS.gemini.prompt;

  if(editor.tagName === "TEXTAREA"){
    editor.value = geminiPrompt;
  } else {
    editor.innerText = geminiPrompt;
  }

  editor.dispatchEvent(new Event("input", {bubbles: true}));

  waitForImage();

}, 2000);

function waitForImage(){
  const timer = setInterval(() => {
    const imgPreview =
      document.querySelector('img[src^="blob:"]');

    if(!imgPreview) return;

    clearInterval(timer);

    alert("Image uploaded. Click Send manually.");
  }, 500);
}

}

})();
