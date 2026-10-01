/* ===========================================================
   Utilitas bersama untuk semua game
   - Idle/attract mode: setelah tidak disentuh sekian lama,
     tampil layar ajakan (opsional, dipanggil manual per halaman)
   =========================================================== */

function initIdleScreen(timeoutMs = 60000) {
  const idle = document.getElementById("idle-screen");
  if (!idle) return;
  let timer = null;

  function reset() {
    idle.classList.remove("show");
    clearTimeout(timer);
    timer = setTimeout(() => idle.classList.add("show"), timeoutMs);
  }

  ["click", "touchstart", "mousemove", "keydown"].forEach((evt) =>
    document.addEventListener(evt, reset, { passive: true }),
  );

  idle.addEventListener("click", reset);
  idle.addEventListener("touchstart", reset);

  reset();
}

function goHome() {
  // games are one folder deep: games/<game>/index.html -> ../../index.html
  window.location.href = "../../index.html";
}

function goTo(path) {
  window.location.href = path;
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function initDefaultAudio() {
  const existing = document.getElementById("default-audio-toggle");
  if (existing) return;

  let audioCtx = null;
  let masterGain = null;
  let intervalId = null;
  let enabled = false;

  function ensureAudio() {
    if (!audioCtx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioCtx = new AudioCtor();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.05;
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    return audioCtx;
  }

  function playTone(
    freq,
    duration = 0.28,
    volume = 0.18,
    type = "sine",
    sweep = 0,
  ) {
    const ctx = ensureAudio();
    if (!ctx || !masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweep !== 0) {
      osc.frequency.linearRampToValueAtTime(
        freq + sweep,
        ctx.currentTime + duration,
      );
    }

    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(masterGain);

    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  function playPattern() {
    if (!enabled) return;
    const notes = [220, 277, 330, 392, 330, 277];
    const note = notes[Math.floor(Math.random() * notes.length)];
    playTone(note, 0.22, 0.16, "sine", 30);
    if (Math.random() > 0.5) {
      playTone(note / 2, 0.18, 0.08, "triangle", 15);
    }
  }

  function playButtonSound() {
    if (!enabled) return;
    playTone(620, 0.08, 0.06, "triangle", 80);
    setTimeout(() => playTone(780, 0.08, 0.05, "triangle", 60), 65);
  }

  function playDiceSound() {
    if (!enabled) return;
    [340, 520, 670].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.12, 0.07, "square", 60), idx * 70);
    });
  }

  function playWinSound() {
    if (!enabled) return;
    [392, 523, 659, 783].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.16, 0.08, "triangle", 40), idx * 110);
    });
  }

  function playLoseSound() {
    if (!enabled) return;
    [330, 262, 220].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.18, 0.07, "sawtooth", -30), idx * 140);
    });
  }

  function playLadderSound() {
    if (!enabled) return;
    [440, 554, 698].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.14, 0.08, "triangle", 30), idx * 80);
    });
  }

  function playSnakeSound() {
    if (!enabled) return;
    [360, 270, 220].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.15, 0.06, "sawtooth", -40), idx * 100);
    });
  }

  function startLoop() {
    if (intervalId) return;
    intervalId = setInterval(playPattern, 1800);
  }

  function stopLoop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  const toggle = document.createElement("button");
  toggle.id = "default-audio-toggle";
  toggle.type = "button";
  toggle.className = "audio-toggle";
  toggle.setAttribute("aria-label", "Toggle suara default");
  toggle.textContent = "🔊";

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    if (enabled) {
      ensureAudio();
      startLoop();
      playPattern();
      toggle.textContent = "🔊";
      toggle.title = "Suara aktif";
    } else {
      stopLoop();
      toggle.textContent = "🔇";
      toggle.title = "Suara mati";
    }
  });

  document.body.appendChild(toggle);
  toggle.title = "Suara mati";
  toggle.textContent = "🔇";

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!target || !(target instanceof HTMLElement)) return;

      if (target.closest("button")) {
        playButtonSound();
      }

      if (target.closest("#roll-btn") || target.closest(".roll-btn")) {
        playDiceSound();
      }
    },
    { passive: true },
  );

  window.museumAudio = {
    isEnabled: () => enabled,
    setEnabled: (nextEnabled) => {
      enabled = Boolean(nextEnabled);
      if (enabled) {
        ensureAudio();
        startLoop();
        playPattern();
        toggle.textContent = "🔊";
        toggle.title = "Suara aktif";
      } else {
        stopLoop();
        toggle.textContent = "🔇";
        toggle.title = "Suara mati";
      }
    },
    playButtonSound,
    playDiceSound,
    playWinSound,
    playLoseSound,
    playLadderSound,
    playSnakeSound,
  };

  ["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      () => {
        if (!enabled) return;
        ensureAudio();
      },
      { once: true },
    );
  });
}

function playMuseumWelcomeVoice() {
  const greeting =
    "Haiii gengs! Selamat datang di game Affandi! Siap-siap buat seru-seruan sambil kenalan sama Museum Affandi, tempatnya keren banget buat ngelihat karya dan sejarah seni yang kece ini!";

  if (!("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(greeting);
  utterance.lang = "id-ID";
  utterance.rate = 1.18;
  utterance.pitch = 1.28;
  utterance.volume = 0.9;
  synth.speak(utterance);
}

function initWelcomeVoice() {
  const preferAudio = window.museumAudio && window.museumAudio.isEnabled;
  if (preferAudio && window.museumAudio.isEnabled()) {
    setTimeout(playMuseumWelcomeVoice, 650);
    return;
  }

  const resumeOnUserAction = () => {
    setTimeout(playMuseumWelcomeVoice, 700);
    document.removeEventListener("pointerdown", resumeOnUserAction, true);
    document.removeEventListener("keydown", resumeOnUserAction, true);
  };

  document.addEventListener("pointerdown", resumeOnUserAction, true);
  document.addEventListener("keydown", resumeOnUserAction, true);
  setTimeout(() => {
    if (window.speechSynthesis && !window.speechSynthesis.speaking) {
      try {
        playMuseumWelcomeVoice();
      } catch (error) {
        console.warn("Welcome voice not started automatically:", error);
      }
    }
  }, 900);
}

document.addEventListener("DOMContentLoaded", () => {
  initDefaultAudio();
});

window.playMuseumWelcomeVoice = playMuseumWelcomeVoice;
