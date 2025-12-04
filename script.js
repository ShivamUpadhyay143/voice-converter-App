const speech = new SpeechSynthesisUtterance();
let voices = [];
const voiceSelect = document.getElementById("voiceSelect");
const speakBtn = document.getElementById("speakBtn");
const recordBtn = document.getElementById("recordBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const textarea = document.getElementById("text-input");
const historyList = document.getElementById("history");

// Load available voices
window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice, i) => {
    const option = new Option(`${voice.name} (${voice.lang})`, i);
    voiceSelect.add(option);
  });
  if (voices.length) speech.voice = voices[0];
};

// Change selected voice
voiceSelect.addEventListener("change", () => {
  speech.voice = voices[voiceSelect.value];
});

// Text to Speech
speakBtn.addEventListener("click", () => {
  const text = textarea.value.trim();
  if (!text) return alert("Please enter some text.");
  speech.text = text;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
  saveToHistory(text, "TTS");
});

// Speech to Text
recordBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = (e) => {
    const voiceText = e.results[0][0].transcript;
    textarea.value += (textarea.value ? '\n' : '') + voiceText;
    saveToHistory(voiceText, "STT");
  };

  recognition.onerror = (err) => {
    console.error(err);
    alert("Voice recognition error or not supported.");
  };
});

// Copy to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(textarea.value);
  alert("Copied!");
});

// Clear text
clearBtn.addEventListener("click", () => {
  textarea.value = "";
});

// Save to DB
function saveToHistory(text, type) {
  fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, type }),
  })
    .then(() => fetchHistory())
    .catch((err) => console.error(err));
}

// Fetch and render history
function fetchHistory() {
  fetch("/history")
    .then(res => res.json())
    .then(data => {
      historyList.innerHTML = "";
      data.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `[${entry.type}] ${entry.text} - ${new Date(entry.timestamp).toLocaleString()}`;
        historyList.appendChild(li);
      });
    });
}

fetchHistory();
