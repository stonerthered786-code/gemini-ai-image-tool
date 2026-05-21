// ==UserScript==
// @name         Gemini AI Image Tool
// @namespace    https://github.com/stonerthered786-code/gemini-ai-image-tool
// @version      1.3
// @description  Add AI button on images to send them to Gemini for professional portrait transformation
// @author       stonerthered786
// @match        *://*/*
// @exclude      https://jathara.thecircleapp.in/*/create-layout*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/stonerthered786-code/gemini-ai-image-tool/main/gemini-ai-image-tool.user.js
// @downloadURL  https://raw.githubusercontent.com/stonerthered786-code/gemini-ai-image-tool/main/gemini-ai-image-tool.user.js
// ==/UserScript==

(function () {

'use strict';

const MIN_SIZE = 200;

const PROMPT = `Transform the input image into a professional political-style portrait while preserving the original photo composition.
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
Preserve identity accurately`;

//////////////////////////////////////////////////
// IMAGE BUTTON
//////////////////////////////////////////////////

if(!location.hostname.includes("gemini.google.com")){

function addButton(img){

if(img.dataset.aiAttached) return;
img.dataset.aiAttached = true;

if(img.naturalWidth < MIN_SIZE) return;

const wrapper = document.createElement("div");
wrapper.style.position = "relative";
wrapper.style.display = "inline-block";

img.parentNode.insertBefore(wrapper,img);
wrapper.appendChild(img);

const btn = document.createElement("button");
btn.innerText = "AI";

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


wrapper.appendChild(btn);
    wrapper.addEventListener("mouseenter", () => {
  btn.style.opacity = "1";
});

wrapper.addEventListener("mouseleave", () => {
  btn.style.opacity = "0";
});


btn.onclick = async ()=>{

const canvas = document.createElement("canvas");
canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;

const ctx = canvas.getContext("2d");
ctx.drawImage(img,0,0);

canvas.toBlob(async blob=>{

const item = new ClipboardItem({"image/png":blob});
await navigator.clipboard.write([item]);

window.open("https://gemini.google.com/app","_blank");

});

};

}

function scan(){

document.querySelectorAll("img").forEach(img=>{

if(img.complete){
addButton(img);
}else{
img.onload=()=>addButton(img);
}

});

}

scan();

new MutationObserver(scan)
.observe(document.body,{childList:true,subtree:true});

}

//////////////////////////////////////////////////
// GEMINI AUTOMATION
//////////////////////////////////////////////////

if(location.hostname.includes("gemini.google.com")){

setTimeout(()=>{

const editor =
document.querySelector("textarea") ||
document.querySelector('[contenteditable="true"]');

if(!editor) return;

editor.focus();

if(editor.tagName==="TEXTAREA"){
editor.value = PROMPT;
}else{
editor.innerText = PROMPT;
}

editor.dispatchEvent(new Event("input",{bubbles:true}));

waitForImage();

},2000);

function waitForImage(){

const timer = setInterval(()=>{

const imgPreview =
document.querySelector('img[src^="blob:"]');

if(!imgPreview) return;

clearInterval(timer);

alert("Image uploaded. Click Send manually.");
},500);

}

}

})();
