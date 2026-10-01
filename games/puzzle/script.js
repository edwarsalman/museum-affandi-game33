/* ===========================================================
   Puzzle Lukisan - logika permainan
   Interaksi: ketuk 1 potongan, lalu ketuk potongan lain untuk
   menukar posisi (paling mudah untuk layar sentuh, tanpa drag).
   PUZZLE_DATA disediakan oleh puzzle-data.js.
   =========================================================== */

let levelIndex = 0;
let gridN = 4;
let tiles = []; // tiles[cellIndex] = correctIndex
let selectedCell = null;
let moves = 0;
let startTime = null;
let timerHandle = null;

const boardEl = document.getElementById("pz-board");
const previewEl = document.getElementById("pz-preview");
const pickerEl = document.getElementById("pz-picker");
const hudLevel = document.getElementById("hud-level");
const hudMoves = document.getElementById("hud-moves");
const hudTime = document.getElementById("hud-time");
const descriptionEl = document.getElementById("pz-description");

function renderPicker() {
  pickerEl.innerHTML = "";
  PUZZLE_DATA.forEach((level, idx) => {
    const thumb = document.createElement("div");
    thumb.className = "pz-thumb" + (idx === levelIndex ? " active" : "");
    thumb.style.backgroundImage = `url('../../${level.src}')`;
    thumb.innerHTML = `<span class="label">Lukisan ${idx + 1}</span>`;
    thumb.onclick = () => {
      levelIndex = idx;
      loadLevel(levelIndex);
    };
    pickerEl.appendChild(thumb);
  });
}

function setDifficulty(n) {
  gridN = n;
  document
    .querySelectorAll(".pz-diffs .btn")
    .forEach((b) => b.classList.remove("active"));
  shuffleBoard();
}

function loadLevel(i) {
  const level = PUZZLE_DATA[i];
  previewEl.src = "../../" + level.src;
  descriptionEl.textContent = level.description || "";
  hudLevel.textContent = i + 1;
  renderPicker();
  shuffleBoard();
}

function shuffleBoard() {
  clearInterval(timerHandle);
  moves = 0;
  hudMoves.textContent = 0;
  startTime = Date.now();
  hudTime.textContent = "00:00";
  timerHandle = setInterval(() => {
    hudTime.textContent = formatTime((Date.now() - startTime) / 1000);
  }, 1000);

  const total = gridN * gridN;
  let order = shuffleArray([...Array(total).keys()]);
  // avoid an already-solved shuffle
  while (order.every((v, idx) => v === idx)) {
    order = shuffleArray([...Array(total).keys()]);
  }
  tiles = order;
  selectedCell = null;
  renderBoard();
}

function renderBoard() {
  const level = PUZZLE_DATA[levelIndex];
  boardEl.innerHTML = "";
  const boardSize = boardEl.clientWidth || 760;
  const tileSize = boardSize / gridN;

  tiles.forEach((correctIdx, cellIdx) => {
    const tile = document.createElement("div");
    tile.className = "pz-tile";
    tile.dataset.cell = cellIdx;

    const row = Math.floor(cellIdx / gridN);
    const col = cellIdx % gridN;
    tile.style.width = tileSize + "px";
    tile.style.height = tileSize + "px";
    tile.style.left = col * tileSize + "px";
    tile.style.top = row * tileSize + "px";

    const cRow = Math.floor(correctIdx / gridN);
    const cCol = correctIdx % gridN;
    tile.style.backgroundImage = `url('../../${level.src}')`;
    tile.style.backgroundSize = `${boardSize}px ${boardSize}px`;
    tile.style.backgroundPosition = `-${cCol * tileSize}px -${cRow * tileSize}px`;

    if (correctIdx === cellIdx) tile.classList.add("correct");

    tile.addEventListener("click", () => onTileTap(cellIdx));
    boardEl.appendChild(tile);
  });
}

function onTileTap(cellIdx) {
  if (tiles[cellIdx] === cellIdx) {
    // already correct; still allow selecting in case user wants to move it away accidentally? keep simple: ignore
  }
  if (selectedCell === null) {
    selectedCell = cellIdx;
    highlightCell(cellIdx, true);
    return;
  }
  if (selectedCell === cellIdx) {
    highlightCell(cellIdx, false);
    selectedCell = null;
    return;
  }
  // swap
  [tiles[selectedCell], tiles[cellIdx]] = [tiles[cellIdx], tiles[selectedCell]];
  moves++;
  hudMoves.textContent = moves;
  highlightCell(selectedCell, false);
  selectedCell = null;
  renderBoard();
  checkWin();
}

function highlightCell(cellIdx, on) {
  const el = boardEl.querySelector(`[data-cell="${cellIdx}"]`);
  if (el) el.style.boxShadow = on ? "0 0 0 5px #2A211B inset" : "none";
}

function checkWin() {
  const solved = tiles.every((v, idx) => v === idx);
  if (solved) {
    clearInterval(timerHandle);
    setTimeout(() => {
      document.getElementById("win-text").textContent =
        `Selesai dalam ${moves} gerakan, ${hudTime.textContent}.`;
      document.getElementById("overlay-win").classList.add("show");
    }, 250);
  }
}

function nextLevel() {
  document.getElementById("overlay-win").classList.remove("show");
  levelIndex++;
  if (levelIndex >= PUZZLE_DATA.length) {
    document.getElementById("overlay-finish").classList.add("show");
  } else {
    loadLevel(levelIndex);
  }
}

window.addEventListener("resize", renderBoard);
loadLevel(levelIndex);
