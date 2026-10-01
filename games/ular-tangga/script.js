/* =========================================================
   ULAR TANGGA MUSEUM AFFANDI
   GAME LOGIC
   ========================================================= */

/* =========================================================
   GAME STATE
   ========================================================= */

let players = [];
let currentPlayer = 0;
let boardSize = 0;
let cellSize = 0;
let isAnimating = false;

/* =========================================================
   DOM ELEMENT
   ========================================================= */

const boardEl = document.getElementById("ut-board");
const hudEl = document.getElementById("ut-hud");
const playersEl = document.getElementById("players");
const diceEl = document.getElementById("dice");
const diceFace = document.getElementById("dice-face");
const rollBtn = document.getElementById("roll-btn");
const turnText = document.getElementById("turn-text");

/* =========================================================
   DICE PIPS
   ========================================================= */

const DICE_FACE_PIPS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
};

/* =========================================================
   RENDER DICE
   ========================================================= */

function renderDiceFace(value) {
  if (!diceFace) return;

  diceFace.innerHTML = "";
  const pips = DICE_FACE_PIPS[value] || DICE_FACE_PIPS[1];

  pips.forEach(([x, y]) => {
    const dot = document.createElement("span");
    dot.className = "dice-dot";
    dot.style.left = x + "%";
    dot.style.top = y + "%";
    diceFace.appendChild(dot);
  });
}

/* =========================================================
   CELL NUMBER -> ROW / COLUMN
   ========================================================= */

function cellNumberToRowCol(n) {
  const idx = n - 1;
  const row = Math.floor(idx / BOARD_COLS);
  let colInRow = idx % BOARD_COLS;

  if (row % 2 === 1) {
    colInRow = BOARD_COLS - 1 - colInRow;
  }

  return { row, col: colInRow };
}

/* =========================================================
   CELL CENTER
   ========================================================= */

function cellCenter(n) {
  const { row, col } = cellNumberToRowCol(n);
  const x = col * cellSize + cellSize / 2;
  const y = (BOARD_ROWS - 1 - row) * cellSize + cellSize / 2;
  return { x, y };
}

/* =========================================================
   DEFAULT CELL COLOR
   ========================================================= */

function getClassicCellColor(n) {
  const palette = [THEME_GREEN, THEME_YELLOW, THEME_RED];
  const row = Math.floor((n - 1) / BOARD_COLS);
  const col = (n - 1) % BOARD_COLS;
  const direction = row % 2 === 0 ? col : BOARD_COLS - 1 - col;
  return palette[(row + direction) % palette.length];
}

/* =========================================================
   ISI TEKS KOTAK (tahun dicetak tebal supaya mudah dipindai)
   ========================================================= */

function fillDescText(el, text) {
  text.split(/(\b(?:1[89]\d\d|20\d\d)(?:-\d{4})?\b)/).forEach((part) => {
    if (!part) return;
    if (/^(?:1[89]\d\d|20\d\d)/.test(part)) {
      const strong = document.createElement("strong");
      strong.textContent = part;
      el.appendChild(strong);
    } else {
      el.appendChild(document.createTextNode(part));
    }
  });
}

/* =========================================================
   BUILD BOARD
   ========================================================= */

function buildBoard() {
  boardEl.innerHTML = "";

  boardSize = boardEl.clientWidth || 780;
  cellSize = boardSize / BOARD_COLS;
  boardEl.style.setProperty("--cell", cellSize + "px");

  /* =======================================================
     BUAT 49 CELL
     ======================================================= */

  for (let n = 1; n <= BOARD_SIZE; n++) {
    const { row, col } = cellNumberToRowCol(n);
    const cell = document.createElement("div");

    /* DITAMBAHKAN cell-${n} AGAR BISA DI-STYLING PER KOTAK DI CSS */
    cell.className = `ut-cell cell-${n}`;

    cell.style.width = cellSize + "px";
    cell.style.height = cellSize + "px";
    cell.style.left = col * cellSize + "px";
    cell.style.top = (BOARD_ROWS - 1 - row) * cellSize + "px";

    const tileColor = getClassicCellColor(n);
    cell.style.backgroundColor = tileColor;
    cell.dataset.tone =
      tileColor === THEME_YELLOW ? "yellow" : tileColor === THEME_RED ? "red" : "green";

    /* KOTAK FOTO = daftar PHOTO_CELLS di board-data.js (kotak kuning di draft) */
    const isPhotoCell = PHOTO_CELLS.includes(n);

    if (isPhotoCell) {
      if (CELL_IMAGES[n]) {
        cell.style.backgroundImage = `url("${CELL_IMAGES[n]}")`;
      }
      cell.classList.add("cell-photo");

      const label = CELL_PHOTO_LABELS[n];
      if (label) {
        cell.title = label;
        cell.setAttribute("aria-label", label);

        /* TULISAN KETERANGAN DI DALAM KOTAK FOTO */
        const caption = document.createElement("div");
        caption.className = "cell-caption";
        caption.textContent = label;
        cell.appendChild(caption);
      }
    } else {
      cell.classList.add("cell-text");

      const descBox = document.createElement("div");
      descBox.className = "cell-desc";

      const descText = document.createElement("span");
      descText.className = "cell-desc-text";
      fillDescText(descText, CELL_TEXTS[n] || "");

      descBox.appendChild(descText);
      cell.appendChild(descBox);
    }

    /* NOMOR CELL */
    const numBadge = document.createElement("span");
    numBadge.className = "cell-num";
    numBadge.textContent = n;
    cell.appendChild(numBadge);

    /* SPECIAL CELL */
    if (n === 1 || n === BOARD_SIZE) {
      cell.classList.add("special-cell");
    }

    /* LADDERS & SNAKES */
    if (LADDERS[n]) cell.classList.add("ladder-bottom");
    if (Object.values(LADDERS).includes(n)) cell.classList.add("ladder-top");
    if (SNAKES[n]) cell.classList.add("snake-top");
    if (Object.values(SNAKES).includes(n)) cell.classList.add("snake-bottom");

    boardEl.appendChild(cell);
  }

  drawConnectors(LADDERS, "ladder");
  drawConnectors(SNAKES, "snake");
  fitCellTexts();
  renderTokens();
}

/* =========================================================
   PAS-KAN TULISAN DI DALAM KOTAK
   Huruf dibuat sebesar mungkin, lalu dikecilkan otomatis
   sampai seluruh teks muat di dalam kotaknya.
   ========================================================= */

const TEXT_MAX_RATIO = 0.12; /* ukuran huruf maks = 12% lebar kotak (lebih seragam antar kotak) */
const TEXT_MIN_SIZE = 3;     /* ukuran huruf minimum (px) */

function fitCellTexts() {
  /* Kotak teks */
  document.querySelectorAll(".ut-cell .cell-desc").forEach((desc) => {
    const txt = desc.querySelector(".cell-desc-text");
    if (!txt) return;

    const cs = getComputedStyle(desc);
    const availW = desc.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = desc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);

    let size = cellSize * TEXT_MAX_RATIO;
    desc.style.fontSize = size + "px";

    while ((txt.offsetHeight > availH - 1 || txt.scrollWidth > availW + 1) && size > TEXT_MIN_SIZE) {
      size = Math.max(TEXT_MIN_SIZE, size - 0.5);
      desc.style.fontSize = size + "px";
    }
  });

  /* Keterangan di kotak foto */
  document.querySelectorAll(".ut-cell .cell-caption").forEach((cap) => {
    const maxH = cellSize * 0.4;
    let size = cellSize * 0.15;
    cap.style.fontSize = size + "px";

    while ((cap.offsetHeight > maxH + 1 || cap.scrollWidth > cap.clientWidth + 1) && size > TEXT_MIN_SIZE) {
      size = Math.max(TEXT_MIN_SIZE, size - 0.5);
      cap.style.fontSize = size + "px";
    }
  });
}

/* =========================================================
   VINE PALETTES
   ========================================================= */

const SNAKE_PALETTES = [
  { dark: "#20392C", mid: THEME_GREEN, light: "#8FBF7A", leaf: "#4C8062" },
  { dark: "#254A34", mid: "#3E7856", light: "#7CB98F", leaf: "#5AA06E" },
  { dark: "#1C3626", mid: "#345C42", light: "#87C79A", leaf: "#478758" },
  { dark: "#2A4A2E", mid: "#437350", light: "#9AD3A5", leaf: "#559966" },
  { dark: "#1F3A2A", mid: THEME_GREEN, light: "#7FD1A0", leaf: "#4E8768" }
];

/* =========================================================
   DRAW CONNECTORS
   ========================================================= */

function drawConnectors(map, kind) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  svg.setAttribute("class", "connector-svg");
  svg.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);

  let snakeIndex = 0;

  Object.entries(map).forEach(([from, to]) => {
    const a = cellCenter(Number(from));
    const b = cellCenter(Number(to));

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const centerX = (a.x + b.x) / 2;
    const centerY = (a.y + b.y) / 2;

    const group = document.createElementNS(svgNS, "g");
    group.setAttribute(
      "transform",
      `translate(${centerX} ${centerY}) rotate(${angle}) translate(${-centerX} ${-centerY})`
    );

    if (kind === "ladder") {
      const railWidth = Math.max(6, Math.min(12, cellSize * 0.15)) * LADDER_SCALE;
      const halfLength = length / 2;
      const rungCount = Math.max(4, Math.min(9, Math.round(length / 26)));

      const railLeft = document.createElementNS(svgNS, "path");
      railLeft.setAttribute("class", "connector-rail");
      railLeft.setAttribute("d", `M ${centerX - halfLength} ${centerY - railWidth} L ${centerX + halfLength} ${centerY - railWidth}`);

      const railRight = document.createElementNS(svgNS, "path");
      railRight.setAttribute("class", "connector-rail");
      railRight.setAttribute("d", `M ${centerX - halfLength} ${centerY + railWidth} L ${centerX + halfLength} ${centerY + railWidth}`);

      /* ketebalan garis tangga ikut diskala */
      railLeft.style.strokeWidth = 4 * LADDER_SCALE;
      railRight.style.strokeWidth = 4 * LADDER_SCALE;

      group.appendChild(railLeft);
      group.appendChild(railRight);

      for (let i = 1; i < rungCount; i++) {
        const rung = document.createElementNS(svgNS, "path");
        const t = i / rungCount;
        const x = centerX - halfLength + t * length;
        rung.setAttribute("class", "connector-rung");
        rung.setAttribute("d", `M ${x} ${centerY - railWidth} L ${x} ${centerY + railWidth}`);
        rung.style.strokeWidth = 3 * LADDER_SCALE;
        group.appendChild(rung);
      }
    } else {
      drawVine(svgNS, defs, group, centerX, centerY, length, SNAKE_PALETTES[snakeIndex % SNAKE_PALETTES.length], `vine-grad-${snakeIndex}`);
      snakeIndex++;
    }

    svg.appendChild(group);
  });

  boardEl.appendChild(svg);
}

function smoothPathD(points) {
  if (points.length < 3) {
    return points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
  }
  let d = `${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

function drawVine(svgNS, defs, group, centerX, centerY, length, palette, gradId) {
  const headX = centerX - length / 2;
  const stemWidth = Math.max(4, Math.min(10, cellSize * 0.10)) * VINE_SCALE;
  const seed = Math.abs(Math.round(centerX * 3 + centerY * 7)) % 5;
  const waves = 1.6 + seed * 0.15;
  const amp = Math.max(10, Math.min(22, cellSize * 0.22)) * VINE_SCALE;

  const steps = 48;
  const centerPts = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = headX + t * length;
    const envelope = Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.6;
    const y = centerY + Math.sin(t * Math.PI * 2 * waves + seed) * amp * envelope;
    centerPts.push({ x, y });
  }

  const grad = document.createElementNS(svgNS, "linearGradient");
  grad.setAttribute("id", gradId);
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "0%");
  grad.setAttribute("y2", "100%");
  grad.innerHTML = `
    <stop offset="0%" stop-color="${palette.light}" />
    <stop offset="50%" stop-color="${palette.mid}" />
    <stop offset="100%" stop-color="${palette.dark}" />
  `;
  defs.appendChild(grad);

  const stem = document.createElementNS(svgNS, "path");
  stem.setAttribute("class", "connector-vine-stem");
  stem.setAttribute("d", "M " + smoothPathD(centerPts));
  stem.setAttribute("stroke", `url(#${gradId})`);
  stem.setAttribute("stroke-width", stemWidth.toFixed(1));
  group.appendChild(stem);

  const leafGap = Math.max(4, Math.round(steps / 9));
  let side = 1;

  for (let i = leafGap; i < centerPts.length - 2; i += leafGap) {
    const p = centerPts[i];
    const prev = centerPts[Math.max(0, i - 2)];
    const next = centerPts[Math.min(centerPts.length - 1, i + 2)];

    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const tlen = Math.hypot(dx, dy) || 1;
    const dirX = dx / tlen;
    const dirY = dy / tlen;
    const perpX = -dirY * side;
    const perpY = dirX * side;

    const leafLen = stemWidth * 2.0;
    const base = { x: p.x, y: p.y };
    const tip = {
      x: p.x + perpX * leafLen + dirX * leafLen * 0.35,
      y: p.y + perpY * leafLen + dirY * leafLen * 0.35
    };
    const c1 = {
      x: p.x + perpX * leafLen * 0.55 + dirX * stemWidth * 1.3,
      y: p.y + perpY * leafLen * 0.55 + dirY * stemWidth * 1.3
    };
    const c2 = {
      x: p.x + perpX * leafLen * 0.55 - dirX * stemWidth * 1.3,
      y: p.y + perpY * leafLen * 0.55 - dirX * stemWidth * 1.3
    };

    const leaf = document.createElementNS(svgNS, "path");
    leaf.setAttribute("class", "connector-vine-leaf");
    leaf.setAttribute("d", `M ${base.x.toFixed(1)} ${base.y.toFixed(1)} Q ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${base.x.toFixed(1)} ${base.y.toFixed(1)} Z`);
    leaf.setAttribute("fill", palette.leaf);
    leaf.setAttribute("stroke", palette.dark);
    group.appendChild(leaf);

    const vein = document.createElementNS(svgNS, "path");
    vein.setAttribute("class", "connector-vine-leaf-vein");
    vein.setAttribute("d", `M ${base.x.toFixed(1)} ${base.y.toFixed(1)} L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);
    vein.setAttribute("stroke", palette.dark);
    group.appendChild(vein);

    side *= -1;
  }

  [{ pt: centerPts[0], dir: -1 }, { pt: centerPts[centerPts.length - 1], dir: 1 }].forEach(({ pt, dir }) => {
    const tendril = document.createElementNS(svgNS, "path");
    tendril.setAttribute("class", "connector-vine-tendril");
    tendril.setAttribute("d", buildTendrilPath(pt.x, pt.y, dir, stemWidth));
    tendril.setAttribute("stroke", palette.mid);
    group.appendChild(tendril);
  });
}

function buildTendrilPath(x, y, dir, stemWidth) {
  const turns = 1.4;
  const steps = 20;
  const r0 = stemWidth * 1.6;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const r = r0 * (1 - t) * 0.9 + 2;
    const px = x + dir * (t * r0 * 1.3) + Math.cos(angle) * r * 0.4;
    const py = y + Math.sin(angle) * r;
    d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return d;
}

/* =========================================================
   TOKEN POSITIONING
   ========================================================= */

function renderTokens() {
  document.querySelectorAll(".token").forEach((t) => t.remove());

  const tokenSize = Math.max(46, Math.min(82, cellSize * 0.62));
  const groups = new Map();

  players.forEach((p, i) => {
    if (!groups.has(p.pos)) groups.set(p.pos, []);
    groups.get(p.pos).push({ player: p, index: i });
  });

  groups.forEach((group, pos) => {
    group.forEach(({ player: p }, localIndex) => {
      const token = document.createElement("div");
      token.className = "token";
      token.style.setProperty("--token-size", tokenSize + "px");
      token.style.backgroundColor = p.color;
      token.style.backgroundImage = `url("${p.image}")`;

      let posX, posY;

      if (pos === 0) {
        const spacing = tokenSize * 0.72;
        const totalWidth = (group.length - 1) * spacing + tokenSize;
        posX = cellSize * 0.5 - totalWidth / 2 + tokenSize / 2 + localIndex * spacing;
        posY = boardSize - cellSize * 0.5;
      } else {
        const center = cellCenter(pos);
        const gap = tokenSize * 0.52;

        const layouts = {
          1: [[0, 0]],
          2: [[-gap / 2, 0], [gap / 2, 0]],
          3: [[-gap / 2, -gap / 2], [gap / 2, -gap / 2], [0, gap / 2]],
          4: [[-gap / 2, -gap / 2], [gap / 2, -gap / 2], [-gap / 2, gap / 2], [gap / 2, gap / 2]]
        };

        let offsets = layouts[group.length];
        if (!offsets) {
          const cols = Math.ceil(Math.sqrt(group.length));
          offsets = group.map((_, idx) => [
            (idx % cols - (cols - 1) / 2) * gap,
            (Math.floor(idx / cols) - (Math.ceil(group.length / cols) - 1) / 2) * gap
          ]);
        }

        const [offsetX, offsetY] = offsets[localIndex];
        posX = center.x + offsetX;
        posY = center.y + offsetY;
      }

      token.style.left = posX - tokenSize / 2 + "px";
      token.style.top = posY - tokenSize / 2 + "px";

      boardEl.appendChild(token);
    });
  });
}

/* =========================================================
   PLAYER PANEL
   ========================================================= */

function renderPlayersPanel() {
  playersEl.innerHTML = "";

  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "player-row" + (i === currentPlayer ? " active" : "");
    row.innerHTML = `
      <div class="player-dot" style="background-color:${p.color}; background-image:url('${p.image}');"></div>
      <div>${p.name}</div>
      <div class="player-pos">Kotak ${p.pos}</div>
    `;
    playersEl.appendChild(row);
  });

  if (players.length > 0) {
    turnText.textContent = `Giliran ${players[currentPlayer].name}`;
  }
}

/* =========================================================
   INITIAL DICE
   ========================================================= */

renderDiceFace(1);

/* =========================================================
   START GAME
   ========================================================= */

function startGame(numPlayers) {
  document.getElementById("overlay-start").classList.remove("show");

  players = [];
  for (let i = 0; i < numPlayers; i++) {
    players.push({
      name: PLAYER_NAMES[i],
      color: PLAYER_COLORS[i],
      image: PLAYER_IMAGES[i],
      pos: 0
    });
  }

  currentPlayer = 0;
  isAnimating = false;

  buildBoard();
  renderPlayersPanel();
}

function resetGame() {
  document.getElementById("overlay-win").classList.remove("show");
  document.getElementById("overlay-start").classList.add("show");
}

/* =========================================================
   ROLL DICE
   ========================================================= */

async function rollDice() {
  if (isAnimating) return;

  isAnimating = true;
  rollBtn.disabled = true;
  diceEl.classList.add("rolling");

  const spins = 12;

  for (let i = 0; i < spins; i++) {
    const face = 1 + Math.floor(Math.random() * 6);
    renderDiceFace(face);
    await sleep(60);
  }

  diceEl.classList.remove("rolling");

  const finalRoll = 1 + Math.floor(Math.random() * 6);
  renderDiceFace(finalRoll);

  await movePlayer(finalRoll);

  rollBtn.disabled = false;
  isAnimating = false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* =========================================================
   MOVE PLAYER
   ========================================================= */

async function movePlayer(steps) {
  const p = players[currentPlayer];
  const target = p.pos + steps;

  if (target > BOARD_SIZE) {
    turnText.textContent = `${p.name} mendapatkan ${steps}, tetapi melebihi kotak akhir. Giliran berpindah.`;
    currentPlayer = (currentPlayer + 1) % players.length;
    renderPlayersPanel();
    return;
  }

  for (let s = p.pos + 1; s <= target; s++) {
    p.pos = s;
    renderTokens();
    renderPlayersPanel();
    await sleep(220);
  }

  if (LADDERS[p.pos]) {
    await sleep(300);
    p.pos = LADDERS[p.pos];
    turnText.textContent = `${p.name} naik tangga ke kotak ${p.pos}!`;
    renderTokens();
    renderPlayersPanel();
  } else if (SNAKES[p.pos]) {
    await sleep(300);
    p.pos = SNAKES[p.pos];
    turnText.textContent = `${p.name} tersangkut tanaman merambat, turun ke kotak ${p.pos}.`;
    renderTokens();
    renderPlayersPanel();
  }

  if (p.pos === BOARD_SIZE) {
    setTimeout(() => {
      document.getElementById("win-title").textContent = `${p.name} Menang!`;
      document.getElementById("win-text").textContent = `${p.name} berhasil mencapai kotak ${BOARD_SIZE} dan memenangkan permainan!`;
      document.getElementById("overlay-win").classList.add("show");
    }, 300);
    return;
  }

  currentPlayer = (currentPlayer + 1) % players.length;
  renderPlayersPanel();
}

window.addEventListener("resize", () => {
  if (players.length) {
    buildBoard();
  }
});