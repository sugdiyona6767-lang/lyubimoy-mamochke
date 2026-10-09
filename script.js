const mouse = document.getElementById("mouse");
const cat = document.getElementById("cat");
const hint = document.getElementById("hint");
const bowsPanel = document.getElementById("bowsPanel");
const bowsEl = document.getElementById("bows");
const bowWrap = document.getElementById("bowWrap");
const bowCounter = document.getElementById("bowCounter");
const petPanel = document.getElementById("petPanel");
const speechBubble = document.getElementById("speechBubble");
const musicBtn = document.getElementById("musicBtn");

const bowColors = [
  ["Пудрово-розовый", "#dca8ba"],
  ["Лавандовый", "#c7b7d8"],
  ["Персиковый", "#e5b3a5"],
  ["Голубой фарфор", "#b8cedd"],
  ["Шалфейный", "#becdb8"],
  ["Шампань", "#d9c59d"],
  ["Кремовый", "#e6d5c6"]
];

const warmPhrases = [
  "Ойжон, вы моё самое тёплое место.",
  "Ойжон, рядом с вами всегда спокойно.",
  "Ойжон, ваша улыбка делает мой день светлее.",
  "Ойжон, спасибо за вашу нежность.",
  "Ойжон, вы для меня настоящий дом.",
  "Ойжон, я очень-очень вас люблю.",
  "Ойжон, вы моё маленькое чудо.",
  "Ойжон, пусть у вас всегда будет тепло на сердце.",
  "Ойжон, вы заслуживаете самые добрые дни.",
  "Ойжон, спасибо, что вы есть.",
  "Ойжон, ваша любовь делает мир мягче.",
  "Ойжон, вы моя самая родная."
];

const tinyPhrases = [
  "люблю вас ♡",
  "моя родная",
  "вы моё тепло",
  "самая любимая",
  "мой уют",
  "моё солнышко",
  "вы чудо",
  "обнимаю крепко",
  "рядом навсегда",
  "моё счастье",
  "самая нежная",
  "моя Ойжон ♡"
];

let usedBows = new Set();
let petting = false;
let lastPetTime = 0;
let phraseTimer = null;

let audioCtx = null;
let musicNodes = [];
let musicOn = false;
let purrOsc = null;
let purrGain = null;

function showSpeech(text, duration = 4200) {
  speechBubble.textContent = text;
  speechBubble.classList.remove("hidden");

  clearTimeout(showSpeech._t);

  showSpeech._t = setTimeout(() => {
    if (!petting) speechBubble.classList.add("hidden");
  }, duration);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

mouse.addEventListener("click", () => {
  mouse.classList.add("hidden");
  cat.classList.remove("sad");
  cat.classList.add("happy");

  hint.textContent = "ура! теперь котик счастлив ♡";
  bowsPanel.classList.remove("hidden");

  showSpeech("Ойжон, вы только посмотрите, я уже не грущу ♡");
});

bowColors.forEach(([name, color], index) => {
  const btn = document.createElement("button");

  btn.className = "bow-choice";
  btn.type = "button";
  btn.title = name;
  btn.style.setProperty("--c", color);
  btn.innerHTML = "<span></span>";

  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".bow-choice")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active", "used");

    usedBows.add(index);

    bowWrap.style.setProperty("--bow", color);
    bowWrap.classList.remove("show");

    void bowWrap.offsetWidth;

    bowWrap.classList.add("show");

    showSpeech(randomFrom(warmPhrases));

    bowCounter.textContent = `примерено: ${usedBows.size} / 7`;

    if (usedBows.size === 7) {
      petPanel.classList.remove("hidden");
      hint.textContent = "кажется, котёнок хочет ласки… ♡";

      setTimeout(() => {
        petPanel.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 350);
    }
  });

  bowsEl.appendChild(btn);
});

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function startMusic() {
  initAudio();
  stopMusic();

  const master = audioCtx.createGain();
  master.gain.value = 0.035;
  master.connect(audioCtx.destination);

  const notes = [
    261.63,
    329.63,
    392.00,
    329.63,
    293.66,
    349.23,
    440.00,
    349.23
  ];

  let i = 0;

  const playNote = () => {
    if (!musicOn) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i % notes.length] / 2;

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.23,
      audioCtx.currentTime + 0.08
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + 1.7
    );

    osc.connect(gain);
    gain.connect(master);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.8);

    i++;
  };

  playNote();

  const interval = setInterval(playNote, 1500);

  musicNodes = [master, interval];
}

function stopMusic() {
  if (musicNodes.length) {
    const [master, interval] = musicNodes;

    clearInterval(interval);

    try {
      master.disconnect();
    } catch {}

    musicNodes = [];
  }
}

musicBtn.addEventListener("click", () => {
  musicOn = !musicOn;

  musicBtn.classList.toggle("on", musicOn);
  musicBtn.textContent = musicOn ? "♪" : "♫";

  if (musicOn) {
    startMusic();
  } else {
    stopMusic();
  }
});

function startPurr() {
  initAudio();

  if (purrOsc) return;

  purrOsc = audioCtx.createOscillator();
  purrGain = audioCtx.createGain();

  purrOsc.type = "sine";
  purrOsc.frequency.value = 28;
  purrGain.gain.value = 0.035;

  purrOsc.connect(purrGain);
  purrGain.connect(audioCtx.destination);

  purrOsc.start();
}

function stopPurr() {
  if (!purrOsc) return;

  try {
    purrOsc.stop();
  } catch {}

  try {
    purrOsc.disconnect();
    purrGain.disconnect();
  } catch {}

  purrOsc = null;
  purrGain = null;
}

function beginPetting() {
  if (usedBows.size < 7) return;

  petting = true;
  cat.classList.add("purring");

  startPurr();
  showSpeech(randomFrom(tinyPhrases), 8000);

  if (!phraseTimer) {
    phraseTimer = setInterval(() => {
      if (petting) {
        showSpeech(randomFrom(tinyPhrases), 8000);
      }
    }, 5000);
  }
}

function endPetting() {
  petting = false;

  cat.classList.remove("purring");
  stopPurr();

  clearInterval(phraseTimer);
  phraseTimer = null;

  setTimeout(() => {
    speechBubble.classList.add("hidden");
  }, 1300);
}

function petMove(e) {
  if (!petting || usedBows.size < 7) return;

  e.preventDefault();

  const now = Date.now();

  if (now - lastPetTime > 260) {
    lastPetTime = now;

    if (navigator.vibrate) {
      navigator.vibrate(28);
    }
  }
}

cat.addEventListener("pointerdown", (e) => {
  if (usedBows.size < 7) return;

  cat.setPointerCapture?.(e.pointerId);

  beginPetting();
  petMove(e);
});

cat.addEventListener("pointermove", petMove);
cat.addEventListener("pointerup", endPetting);
cat.addEventListener("pointercancel", endPetting);

cat.addEventListener("pointerleave", () => {
  if (petting) {
    endPetting();
  }
});

/*
  НАСТОЯЩИЙ ИИ:

  Пока сайт полностью бесплатный и использует массивы warmPhrases и tinyPhrases.

  Позже можно заменить randomFrom(warmPhrases) на запрос к backend:
  /api/mom-message

  ВАЖНО:
  Никогда не вставляйте секретный API-ключ прямо в этот файл.
*/
