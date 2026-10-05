import { normalizePhrase, graphemes, renderPlate, plateToBlob } from "./plate.js";

const phraseInput = document.querySelector("#phrase");
const countEl = document.querySelector("#count");
const canvas = document.querySelector("#plate");
const stage = document.querySelector("#stage");
const saveBtn = document.querySelector("#save");
const saveHint = document.querySelector("#save-hint");
const examples = document.querySelector("#examples");

function currentPhrase() {
  return normalizePhrase(phraseInput.value);
}

function syncCount(phrase) {
  const n = graphemes(phrase).length;
  countEl.textContent = `${n} / 4`;
}

function paint() {
  const phrase = currentPhrase();
  if (phraseInput.value !== phrase) {
    const cursor = phrase.length;
    phraseInput.value = phrase;
    phraseInput.setSelectionRange(cursor, cursor);
  }
  syncCount(phrase);
  renderPlate(canvas, phrase);
  const empty = phrase.length === 0;
  stage.classList.toggle("is-empty", empty);
  saveBtn.disabled = empty;
  saveHint.textContent = empty ? "未有字之前唔可以存。" : "存成 PNG，再轉發去聊天室。";
}

async function savePlate() {
  const phrase = currentPhrase();
  if (!phrase) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "存緊…";
  try {
    renderPlate(canvas, phrase);
    const blob = await plateToBlob(canvas);
    const filename = `四字紙皮-${phrase}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "四字紙皮",
          text: "虛構紙皮石門牌，不可當真實地址或門牌使用。",
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (error) {
    saveHint.textContent = error instanceof Error ? error.message : "存圖失敗，請再試。";
  } finally {
    saveBtn.disabled = currentPhrase().length === 0;
    saveBtn.textContent = "存圖";
  }
}

phraseInput.addEventListener("input", paint);
phraseInput.addEventListener("paste", () => {
  window.requestAnimationFrame(paint);
});

examples.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-phrase]");
  if (!button) return;
  phraseInput.value = button.dataset.phrase;
  phraseInput.focus();
  paint();
});

document.querySelector("#composer").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!saveBtn.disabled) savePlate();
});

saveBtn.addEventListener("click", savePlate);

document.fonts.ready.then(paint);
paint();
