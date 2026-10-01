/* ===========================================================
   Cari Perbedaan - logika permainan
   DIFF_DATA disediakan oleh diff-data.js (5 lukisan Affandi).
   Untuk ganti gambar asli: taruh file di
   ../../assets/images/lukisan/ lalu ubah path & titik "points"
   di diff-data.js sesuai posisi perbedaan pada gambar barumu.
   =========================================================== */

let levelIndex = 0;
let foundIds = new Set();
let timeLeft = 90;
let timerHandle = null;
const TIME_PER_LEVEL = 90;

const paneA = document.getElementById("pane-a");
const paneB = document.getElementById("pane-b");
const hudLevel = document.getElementById("hud-level");
const hudFound = document.getElementById("hud-found");
const hudTotal = document.getElementById("hud-total");
const hudTime = document.getElementById("hud-time");
const hudCoordinate = document.getElementById("hud-coordinate");
const descriptionEl = document.getElementById("fd-description");

function updateCoordinate(e, paneEl) {
  const image = paneEl.querySelector("img");
  const rect = image.getBoundingClientRect();
  const x = Math.round(
    ((e.clientX - rect.left) * image.naturalWidth) / rect.width,
  );
  const y = Math.round(
    ((e.clientY - rect.top) * image.naturalHeight) / rect.height,
  );
  hudCoordinate.textContent = `${x}, ${y}`;
}

function loadLevel(i) {
  clearInterval(timerHandle);
  foundIds.clear();
  const level = DIFF_DATA[i];

  paneA.innerHTML = `<img src="../../${level.original}" draggable="false">`;
  paneB.innerHTML = `<img src="../../${level.modified}" draggable="false">`;

  hudLevel.textContent = i + 1;
  descriptionEl.textContent = level.description || "";
  hudTotal.textContent = level.points.length;
  hudFound.textContent = 0;
  timeLeft = TIME_PER_LEVEL;
  hudTime.textContent = formatTime(timeLeft);

  paneA.onclick = (e) => handleClick(e, paneA, level);
  paneB.onclick = (e) => handleClick(e, paneB, level);
  paneA.onmousemove = (e) => updateCoordinate(e, paneA);
  paneB.onmousemove = (e) => updateCoordinate(e, paneB);

  timerHandle = setInterval(() => {
    timeLeft--;
    hudTime.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerHandle);
      document.getElementById("overlay-time").classList.add("show");
    }
  }, 1000);
}

function handleClick(e, paneEl, level) {
  updateCoordinate(e, paneEl);
  const image = paneEl.querySelector("img");
  const rect = image.getBoundingClientRect();
  const scaleX = image.naturalWidth / rect.width;
  const scaleY = image.naturalHeight / rect.height;
  const imageX = (e.clientX - rect.left) * scaleX;
  const imageY = (e.clientY - rect.top) * scaleY;
  const x = (imageX * level.width) / image.naturalWidth;
  const y = (imageY * level.height) / image.naturalHeight;

  let hit = null;
  for (const p of level.points) {
    if (foundIds.has(p.x + "_" + p.y)) continue;
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist <= p.r) {
      hit = p;
      break;
    }
  }

  if (hit) {
    foundIds.add(hit.x + "_" + hit.y);
    markFound(hit, level, paneA);
    markFound(hit, level, paneB);
    hudFound.textContent = foundIds.size;
    if (foundIds.size === level.points.length) {
      clearInterval(timerHandle);
      setTimeout(() => {
        document.getElementById("win-text").textContent =
          `Kamu menemukan semua ${level.points.length} perbedaan dalam ${formatTime(TIME_PER_LEVEL - timeLeft)}.`;
        document.getElementById("overlay-win").classList.add("show");
      }, 350);
    }
  } else {
    showMiss(e, paneEl);
  }
}

function markFound(point, level, targetPane) {
  const image = targetPane.querySelector("img");
  const imageRect = image.getBoundingClientRect();
  const paneRect = targetPane.getBoundingClientRect();
  const displayScaleX = imageRect.width / image.naturalWidth;
  const displayScaleY = imageRect.height / image.naturalHeight;
  const canonicalScaleX = image.naturalWidth / level.width;
  const canonicalScaleY = image.naturalHeight / level.height;
  const marker = document.createElement("div");
  marker.className = "found-marker";
  const centerX = point.x * canonicalScaleX * displayScaleX;
  const centerY = point.y * canonicalScaleY * displayScaleY;
  const markerRadius = level.markerRadius || point.r;
  const size = Math.max(markerRadius * 2 * canonicalScaleX * displayScaleX, 64);
  marker.style.left =
    imageRect.left - paneRect.left + centerX - size / 2 + "px";
  marker.style.top = imageRect.top - paneRect.top + centerY - size / 2 + "px";
  marker.style.width = size + "px";
  marker.style.height = size + "px";
  targetPane.appendChild(marker);
}

function showMiss(e, paneEl) {
  const rect = paneEl.getBoundingClientRect();
  const flash = document.createElement("div");
  flash.className = "miss-flash";
  flash.style.left = e.clientX - rect.left + "px";
  flash.style.top = e.clientY - rect.top + "px";
  paneEl.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
}

function restartLevel() {
  document.getElementById("overlay-win").classList.remove("show");
  document.getElementById("overlay-time").classList.remove("show");
  loadLevel(levelIndex);
}

function nextLevel() {
  document.getElementById("overlay-win").classList.remove("show");
  levelIndex++;
  if (levelIndex >= DIFF_DATA.length) {
    document.getElementById("overlay-finish").classList.add("show");
  } else {
    loadLevel(levelIndex);
  }
}

loadLevel(levelIndex);
