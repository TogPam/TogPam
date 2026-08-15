const fs = require("fs");

// Các hàm logic (đáng lẽ nên để ở game.js nhưng để đây cho tiện copy)
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
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }
  return board.includes(null) ? null : "draw";
}

const issueTitle = process.argv[2];
const state = JSON.parse(fs.readFileSync("./state.json", "utf8"));

// 1. Thực hiện nước đi của người chơi
if (issueTitle && issueTitle.startsWith("ttt|")) {
  const move = parseInt(issueTitle.split("|")[1]);
  if (state.board[move] === null) {
    state.board[move] = "X";

    // Kiểm tra sau khi người chơi đi
    let winner = checkWinner(state.board);

    // Bot chỉ đi nếu chưa có người thắng
    if (!winner) {
      const empty = state.board
        .map((v, i) => (v === null ? i : null))
        .filter((v) => v !== null);
      if (empty.length > 0) {
        const botMove = empty[Math.floor(Math.random() * empty.length)];
        state.board[botMove] = "O";
        winner = checkWinner(state.board); // Kiểm tra lại sau khi bot đi
      }
    }

    // 2. Cập nhật trạng thái
    let badge = "";
    if (winner === "X") {
      badge =
        '<br><img src="https://img.shields.io/badge/Winner-You_Are_Pro!-gold?style=for-the-badge&logo=github">';
      state.status = "won";
    } else if (winner === "O") {
      badge =
        '<br><img src="https://img.shields.io/badge/Winner-Bot_Wins-red?style=for-the-badge">';
      state.status = "lost";
    } else if (winner === "draw") {
      badge =
        '<br><img src="https://img.shields.io/badge/Result-Draw-blue?style=for-the-badge">';
      state.status = "draw";
    }

    // 3. Render bàn cờ & Badge
    const renderCell = (v, i) =>
      v
        ? `<img src="https://placehold.co/50x50/21262d/${v === "X" ? "ff5555" : "55ff55"}/png?text=${v}" width="50">`
        : `<a href="https://github.com/TogPam/TogPam/issues/new?title=ttt|${i}"><img src="https://placehold.co/50x50/21262d/21262d.png" width="50"></a>`;

    const boardHtml = `<table border="1" style="border-collapse: collapse; border-color: #30363d;"><tr>${state.board.map((v, i) => `<td width="60" height="60" align="center">${renderCell(v, i)}</td>${(i + 1) % 3 === 0 ? "</tr><tr>" : ""}`).join("")}</table>${badge}`;

    // 4. Ghi vào README
    let readme = fs.readFileSync("./README.md", "utf8");
    readme = readme.replace(
      /<!-- BOARD_START -->[\s\S]*<!-- BOARD_END -->/,
      `<!-- BOARD_START -->\n${boardHtml}\n<!-- BOARD_END -->`,
    );
    fs.writeFileSync("./README.md", readme);
    fs.writeFileSync("./state.json", JSON.stringify(state, null, 2));
  }
}
