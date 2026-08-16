const fs = require("fs");

const issueTitle = process.argv[2] || "";
const statePath = "./state.json";
const readmePath = "./README.md";
const username = "TogPam";

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

let state = { ...DEFAULT_STATE };

if (fs.existsSync(statePath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(statePath, "utf8"));

    if (
      Array.isArray(parsed.board) &&
      parsed.board.length === 9
    ) {
      state = {
        board: parsed.board,
        status: parsed.status || "playing",
      };
    } else {
      console.log("State không hợp lệ, khởi tạo lại.");
    }
  } catch (e) {
    console.log("State file lỗi, khởi tạo lại từ đầu.");
  }
}

// ============================================================
// CHECK WINNER
// ============================================================

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (
      board[a] &&
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
// GET EMPTY CELLS
// ============================================================

function getEmptyCells(board) {
  return board
    .map((value, index) => (value === null ? index : null))
    .filter((value) => value !== null);
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

      const score = minimax(
        board,
        depth + 1,
        false,
      );

      board[index] = null;

      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const index of emptyCells) {
    board[index] = "X";

    const score = minimax(
      board,
      depth + 1,
      true,
    );

    board[index] = null;

    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

// ============================================================
// BOT MOVE
// ============================================================

function getBotMove(board) {
  const emptyCells = getEmptyCells(board);

  if (emptyCells.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    board[index] = "O";

    const score = minimax(
      board,
      0,
      false,
    );

    board[index] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

// ============================================================
// PARSE COMMAND
// ============================================================

const parts = issueTitle.split("|");

if (parts.length !== 2 || parts[0].toLowerCase() !== "ttt") {
  console.log("Issue không phải Tic-Tac-Toe.");
  process.exit(0);
}

const command = parts[1].trim().toLowerCase();

// ============================================================
// RESET
// ============================================================

if (command === "reset") {
  state.board = Array(9).fill(null);
  state.status = "playing";

  console.log("Game đã được reset.");
}

// ============================================================
// PLAYER MOVE
// ============================================================

else if (/^[0-8]$/.test(command)) {
  const move = Number(command);

  console.log("Player move:", move);
  console.log("Board before:", state.board);

  // ----------------------------------------------------------
  // GAME ALREADY FINISHED
  // ----------------------------------------------------------

  if (state.status !== "playing") {
    console.log("Game đã kết thúc.");

  // ----------------------------------------------------------
  // CELL ALREADY USED
  // ----------------------------------------------------------

  } else if (state.board[move] !== null) {
    console.log(
      `Ô ${move} đã được sử dụng bởi ${state.board[move]}.`,
    );

  // ----------------------------------------------------------
  // PLAYER = X
  // ----------------------------------------------------------

  } else {
    state.board[move] = "X";

    console.log(`Player đặt X vào ô ${move}.`);

    // --------------------------------------------------------
    // CHECK PLAYER WIN
    // --------------------------------------------------------

    let winner = checkWinner(state.board);

    if (winner === "X") {
      state.status = "won";

      console.log("Player thắng!");
    }

    // --------------------------------------------------------
    // CHECK DRAW
    // --------------------------------------------------------

    else if (winner === "draw") {
      state.status = "draw";

      console.log("Hòa!");
    }

    // --------------------------------------------------------
    // BOT = O
    // --------------------------------------------------------

    else {
      const botMove = getBotMove(state.board);

      if (botMove !== null) {
        state.board[botMove] = "O";

        console.log(
          `Bot đặt O vào ô ${botMove}.`,
        );
      }

      // ------------------------------------------------------
      // CHECK BOT WIN
      // ------------------------------------------------------

      winner = checkWinner(state.board);

      if (winner === "O") {
        state.status = "lost";

        console.log("Bot thắng!");
      }

      // ------------------------------------------------------
      // CHECK DRAW
      // ------------------------------------------------------

      else if (winner === "draw") {
        state.status = "draw";

        console.log("Hòa!");
      }

      // ------------------------------------------------------
      // GAME CONTINUES
      // ------------------------------------------------------

      else {
        state.status = "playing";
      }
    }
  }
}

// ============================================================
// INVALID COMMAND
// ============================================================

else {
  console.log("Nước đi không hợp lệ:", command);
  process.exit(0);
}

// ============================================================
// STATUS BADGE
// ============================================================

let badge = "";

if (state.status === "won") {
  badge =
    '<br><img src="https://img.shields.io/badge/Winner-You_Are_Pro!-gold?style=for-the-badge&logo=github">';
}

else if (state.status === "lost") {
  badge =
    '<br><img src="https://img.shields.io/badge/Winner-Bot_Wins-red?style=for-the-badge">';
}

else if (state.status === "draw") {
  badge =
    '<br><img src="https://img.shields.io/badge/Result-Draw-blue?style=for-the-badge">';
}

// ============================================================
// RENDER CELL
// ============================================================
// GIỮ NGUYÊN UI CŨ
// ============================================================

const renderCell = (v, i) =>
  v
    ? `<img src="https://placehold.co/50x50/21262d/${
        v === "X" ? "ff5555" : "55ff55"
      }/png?text=${v}" width="50">`
    : `<a href="https://github.com/${username}/${username}/issues/new?title=ttt|${i}"><img src="https://placehold.co/50x50/21262d/21262d.png" width="50"></a>`;

// ============================================================
// RENDER BOARD
// ============================================================
// GIỮ NGUYÊN UI CŨ
// ============================================================

const boardHtml =
  `<table border="1" style="border-collapse: collapse; border-color: #30363d;"><tr>` +
  state.board
    .map(
      (v, i) =>
        `<td width="60" height="60" align="center">${renderCell(
          v,
          i,
        )}</td>${
          (i + 1) % 3 === 0
            ? "</tr>" +
              (i + 1 < 9 ? "<tr>" : "")
            : ""
        }`,
    )
    .join("") +
  `</table>${badge}`;

// ============================================================
// UPDATE README
// ============================================================

if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(
    readmePath,
    "utf8",
  );

  if (
    readme.includes("<!-- BOARD_START -->") &&
    readme.includes("<!-- BOARD_END -->")
  ) {
    readme = readme.replace(
      /<!-- BOARD_START -->[\s\S]*?<!-- BOARD_END -->/,
      `<!-- BOARD_START -->\n${boardHtml}\n<!-- BOARD_END -->`,
    );

    fs.writeFileSync(
      readmePath,
      readme,
      "utf8",
    );

    console.log("README đã được cập nhật.");
  } else {
    console.log(
      "Không tìm thấy BOARD_START / BOARD_END.",
    );
  }
}

// ============================================================
// SAVE STATE
// ============================================================

fs.writeFileSync(
  statePath,
  JSON.stringify(state, null, 2),
  "utf8",
);

console.log("");
console.log("==============================");
console.log("Cập nhật game thành công!");
console.log("Status:", state.status);
console.log("Board:", state.board);
console.log("==============================");
