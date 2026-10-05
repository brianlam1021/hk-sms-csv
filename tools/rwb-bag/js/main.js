import { MAX_CHARS, charsOf, clipPhrase, drawBag, downloadPng } from "./bag.js";

const canvas = document.querySelector("#bag");
const input = document.querySelector("#phrase");
const count = document.querySelector("#count");
const save = document.querySelector("#save");
const examples = document.querySelector("#examples");

function syncExamples(value) {
  const current = clipPhrase(value);
  for (const button of examples.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", button.dataset.phrase === current ? "true" : "false");
  }
}

function render() {
  const phrase = clipPhrase(input.value);
  if (input.value !== phrase) input.value = phrase;
  count.textContent = `${charsOf(phrase).length}/${MAX_CHARS}`;
  syncExamples(phrase);
  drawBag(canvas, phrase);
}

input.addEventListener("input", render);

document.querySelector("#composer").addEventListener("submit", (event) => {
  event.preventDefault();
  input.blur();
});

examples.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-phrase]");
  if (!button) return;
  input.value = button.dataset.phrase;
  render();
  input.focus();
});

save.addEventListener("click", async () => {
  save.disabled = true;
  const previous = save.textContent;
  save.textContent = "儲存中…";
  try {
    await downloadPng(canvas, input.value);
    save.textContent = "已下載";
  } catch {
    save.textContent = "儲存失敗，再試一次";
  }
  window.setTimeout(() => {
    save.disabled = false;
    save.textContent = previous;
  }, 1200);
});

document.fonts.ready.then(render).catch(render);
render();
