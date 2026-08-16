const fs = require("fs");

// ============================================================
// CONFIG
// ============================================================

const issueTitle = process.argv[2] || "";

const STATE_PATH = "./state.json";
const README_PATH = "./README.md";

const GITHUB_USERNAME = "TogPam";
const GITHUB_REPO = "TogPam";

const BOARD_START = "<!-- BOARD_START -->";
const BOARD_END = "<!-- BOARD_END -->";

// ============================================================
// DEFAULT STATE
// ============================================================

const DEFAULT_STATE = {
  board: Array(9).fill(null),
  status: "playing",
};

// ============================================================
// LOAD STATE
// ============================================================

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    console.log("state.json chưa tồn tại. Khởi tạo game mới.");
    return { ...DEFAULT_STATE, board: [...DEFAULT_STATE.board] };
  }

  try {
    const raw = fs.readFileSync(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.board) ||
      parsed.board.length !== 9
    ) {
      throw new Error("State không hợp lệ.");
    }

    return {
      board: parsed.board,
      status: parsed.status || "playing",
    };
  } catch (error) {
    console.log("State file lỗi:", error.message);
    console.log("Khởi tạo game mới.");

    return {
      ...DEFAULT_STATE,
      board: [...DEFAULT_STATE.board],
    };
  }
}

// ============================================================
// SAVE STATE
// ============================================================

function saveState(state) {
  fs.writeFileSync(
    STATE_PATH,
    JSON.stringify(state, null, 2) + "\n",
    "utf8",
  );

  console.log("Đã lưu state.json.");
}

// ============================================================
// WIN CONDITIONS
// ============================================================

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

// ============================================================
// CHECK WINNER
// ============================================================

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (
      board[a] !== null &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  if (!board.includes(null)) {
    return "draw";
  }

  return null;
}

// ============================================================
// EMPTY CELLS
// ============================================================

function getEmptyCells(board) {
  return board
    .map((value, index) => (value === null ? index : null))
    .filter((index) => index !== null);
}

// ============================================================
// MINIMAX
// ============================================================
//
// X = Player
// O = Bot
//
// Bot tries to maximize score.
// Player tries to minimize score.
//
// Score:
// Bot win  = +10
// Player win = -10
// Draw = 0
// ============================================================

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);

  if (winner === "O") {
    return 10 - depth;
  }

  if (winner === "X") {
    return depth - 10;
  }

  if (winner === "draw") {
    return 0;
  }

  const emptyCells = getEmptyCells(board);

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const index of emptyCells) {
      board[index] = "O";

      const score = minimax(board, depth + 1, false);

      board[index] = null;

      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const index of emptyCells) {
    board[index] = "X";

    const score = minimax(board, depth + 1, true);

    board[index] = null;

    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

// ============================================================
// GET BEST BOT MOVE
// ============================================================

function getBestMove(board) {
  const emptyCells = getEmptyCells(board);

  if (emptyCells.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    board[index] = "O";

    const score = minimax(board, 0, false);

    board[index] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

// ============================================================
// RESET GAME
// ============================================================

function resetGame(state) {
  state.board = Array(9).fill(null);
  state.status = "playing";

  console.log("Game đã được reset.");

  saveState(state);
}

// ============================================================
// PARSE ISSUE COMMAND
// ============================================================

function parseCommand(title) {
  const parts = title.split("|");

  if (parts.length !== 2) {
    return null;
  }

  if (parts[0].toLowerCase() !== "ttt") {
    return null;
  }

  return parts[1].trim().toLowerCase();
}

// ============================================================
// SVG ICON
// ============================================================

function svgToDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ============================================================
// EMPTY CELL ICON
// ============================================================

function emptyIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
  <rect
    x="1"
    y="1"
    width="54"
    height="54"
    rx="10"
    fill="#161b22"
    stroke="#30363d"
    stroke-width="2"
  />
  <text
    x="28"
    y="35"
    text-anchor="middle"
    font-family="Arial"
    font-size="24"
    fill="#484f58"
  >+</text>
</svg>`;

  return svgToDataUri(svg);
}

// ============================================================
// X ICON
// ============================================================

function xIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
  <rect
    x="1"
    y="1"
    width="54"
    height="54"
    rx="10"
    fill="#161b22"
    stroke="#30363d"
    stroke-width="2"
  />

  <line
    x1="17"
    y1="17"
    x2="39"
    y2="39"
    stroke="#ff5555"
    stroke-width="5"
    stroke-linecap="round"
  />

  <line
    x1="39"
    y1="17"
    x2="17"
    y2="39"
    stroke="#ff5555"
    stroke-width="5"
    stroke-linecap="round"
  />
</svg>`;

  return svgToDataUri(svg);
}

// ============================================================
// O ICON
// ============================================================

function oIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
  <rect
    x="1"
    y="1"
    width="54"
    height="54"
    rx="10"
    fill="#161b22"
    stroke="#30363d"
    stroke-width="2"
  />

  <circle
    cx="28"
    cy="28"
    r="13"
    fill="none"
    stroke="#55ff55"
    stroke-width="5"
  />
</svg>`;

  return svgToDataUri(svg);
}

// ============================================================
// STATUS BADGE
// ============================================================

function renderBadge(status) {
  if (status === "won") {
    return `
<br>

<img
  src="https://img.shields.io/badge/🏆_Winner-You_Are_Pro!-gold?style=for-the-badge"
  alt="You Win"
/>`;
  }

  if (status === "lost") {
    return `
<br>

<img
  src="https://img.shields.io/badge/🤖_Winner-Bot_Wins-red?style=for-the-badge"
  alt="Bot Wins"
/>`;
  }

  if (status === "draw") {
    return `
<br>

<img
  src="https://img.shields.io/badge/🤝_Result-Draw-blue?style=for-the-badge"
  alt="Draw"
/>`;
  }

  return "";
}

// ============================================================
// RENDER CELL
// ============================================================

function renderCell(value, index, gameFinished) {
  if (value === "X") {
    return `
<td
  width="64"
  height="64"
  align="center"
  valign="middle"
>
  <img
    src="${xIcon()}"
    width="56"
    height="56"
    alt="X"
  />
</td>`;
  }

  if (value === "O") {
    return `
<td
  width="64"
  height="64"
  align="center"
  valign="middle"
>
  <img
    src="${oIcon()}"
    width="56"
    height="56"
    alt="O"
  />
</td>`;
  }

  // Không cho click nếu game đã kết thúc
  if (gameFinished) {
    return `
<td
  width="64"
  height="64"
  align="center"
  valign="middle"
>
  <img
    src="${emptyIcon()}"
    width="56"
    height="56"
    alt="Empty"
  />
</td>`;
  }

  const issueUrl =
    `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/issues/new?title=` +
    encodeURIComponent(`ttt|${index}`);

  return `
<td
  width="64"
  height="64"
  align="center"
  valign="middle"
>
  <a href="${issueUrl}">
    <img
      src="${emptyIcon()}"
      width="56"
      height="56"
      alt="Play ${index}"
    />
  </a>
</td>`;
}

// ============================================================
// RENDER BOARD
// ============================================================

function renderBoard(state) {
  const gameFinished = state.status !== "playing";

  let html = `
<table
  border="0"
  cellpadding="4"
  cellspacing="0"
  align="center"
>
`;

  for (let row = 0; row < 3; row++) {
    html += "<tr>";

    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;

      html += renderCell(
        state.board[index],
        index,
        gameFinished,
      );
    }

    html += "</tr>";
  }

  html += "</table>";

  html += renderBadge(state.status);

  return html;
}

// ============================================================
// UPDATE README
// ============================================================

function updateReadme(state) {
  if (!fs.existsSync(README_PATH)) {
    console.log("Không tìm thấy README.md.");
    return;
  }

  let readme = fs.readFileSync(README_PATH, "utf8");

  if (!readme.includes(BOARD_START)) {
    console.log("Không tìm thấy BOARD_START trong README.");
    return;
  }

  if (!readme.includes(BOARD_END)) {
    console.log("Không tìm thấy BOARD_END trong README.");
    return;
  }

  const boardHtml = renderBoard(state);

  const replacement =
    `${BOARD_START}\n` +
    boardHtml +
    `\n${BOARD_END}`;

  const pattern =
    /<!-- BOARD_START -->[\s\S]*?<!-- BOARD_END -->/;

  readme = readme.replace(pattern, replacement);

  fs.writeFileSync(
    README_PATH,
    readme,
    "utf8",
  );

  console.log("README.md đã được cập nhật.");
}

// ============================================================
// PRINT BOARD
// ============================================================

function printBoard(board) {
  console.log("");
  console.log("Current board:");
  console.log("");

  for (let row = 0; row < 3; row++) {
    const cells = [];

    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      cells.push(board[index] || " ");
    }

    console.log(` ${cells.join(" │ ")} `);

    if (row < 2) {
      console.log("───┼───┼───");
    }
  }

  console.log("");
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log("========================================");
  console.log("       TIC-TAC-TOE GAME ENGINE");
  console.log("========================================");

  console.log("Issue title:", issueTitle);

  const command = parseCommand(issueTitle);

  if (command === null) {
    console.log("Command không hợp lệ.");
    process.exit(0);
  }

  console.log("Command:", command);

  const state = loadState();

  console.log("Status:", state.status);

  printBoard(state.board);

  // ==========================================================
  // RESET
  // ==========================================================

  if (command === "reset") {
    resetGame(state);
    updateReadme(state);

    console.log("Game mới đã sẵn sàng.");
    return;
  }

  // ==========================================================
  // VALIDATE MOVE
  // ==========================================================

  if (!/^[0-8]$/.test(command)) {
    console.log("Nước đi không hợp lệ:", command);
    process.exit(0);
  }

  const move = Number(command);

  console.log("Player move:", move);

  // ==========================================================
  // GAME ALREADY FINISHED
  // ==========================================================

  if (state.status !== "playing") {
    console.log(
      "Game đã kết thúc. Không thể thực hiện nước đi.",
    );

    updateReadme(state);
    return;
  }

  // ==========================================================
  // CELL ALREADY OCCUPIED
  // ==========================================================

  if (state.board[move] !== null) {
    console.log(
      `Ô ${move} đã được sử dụng bởi ${state.board[move]}.`,
    );

    updateReadme(state);
    return;
  }

  // ==========================================================
  // PLAYER MOVE
  // ==========================================================

  state.board[move] = "X";

  console.log(`Player đặt X vào ô ${move}.`);

  printBoard(state.board);

  // ==========================================================
  // CHECK PLAYER WIN
  // ==========================================================

  let winner = checkWinner(state.board);

  if (winner === "X") {
    state.status = "won";

    console.log("🎉 PLAYER WIN!");

    saveState(state);
    updateReadme(state);

    return;
  }

  // ==========================================================
  // CHECK DRAW
  // ==========================================================

  if (winner === "draw") {
    state.status = "draw";

    console.log("🤝 DRAW!");

    saveState(state);
    updateReadme(state);

    return;
  }

  // ==========================================================
  // BOT MOVE
  // ==========================================================

  const botMove = getBestMove(state.board);

  if (botMove !== null) {
    state.board[botMove] = "O";

    console.log(`Bot đặt O vào ô ${botMove}.`);
  }

  printBoard(state.board);

  // ==========================================================
  // CHECK BOT WIN
  // ==========================================================

  winner = checkWinner(state.board);

  if (winner === "O") {
    state.status = "lost";

    console.log("🤖 BOT WIN!");
  } else if (winner === "draw") {
    state.status = "draw";

    console.log("🤝 DRAW!");
  } else {
    state.status = "playing";

    console.log("🎮 Game tiếp tục.");
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  saveState(state);

  // ==========================================================
  // UPDATE README
  // ==========================================================

  updateReadme(state);

  console.log("");
  console.log("========================================");
  console.log("Game update completed.");
  console.log("Status:", state.status);
  console.log("========================================");
}

// ============================================================
// RUN
// ============================================================

try {
  main();
} catch (error) {
  console.error("");
  console.error("❌ GAME ENGINE ERROR");
  console.error(error);
  process.exit(1);
}
