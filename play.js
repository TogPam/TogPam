const fs = require("fs");

const issueTitle = process.argv[2] || "";
const statePath = "./state.json";
const readmePath = "./README.md";
const username = "TogPam"; // Thay bằng tên github của bạn

// 1. Đọc state an toàn, nếu chưa có thì tự tạo mới
let state = { board: Array(9).fill(null), status: "playing" };
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch (e) {
    console.log("State file lỗi, khởi tạo lại từ đầu.");
  }
}

// 2. Hàm kiểm tra người thắng
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

const command = issueTitle.split("|")[1];

// 3. Xử lý lệnh Reset hoặc đánh cờ
if (command === "reset") {
  state.board = Array(9).fill(null);
  state.status = "playing";
} else if (!isNaN(command)) {
  const move = parseInt(command);
  // Chỉ cho đánh khi ô trống và game chưa kết thúc
  if (
    move >= 0 &&
    move < 9 &&
    state.board[move] === null &&
    state.status === "playing"
  ) {
    state.board[move] = "X";

    let winner = checkWinner(state.board);
    if (!winner) {
      const empty = state.board
        .map((v, i) => (v === null ? i : null))
        .filter((v) => v !== null);
      if (empty.length > 0) {
        const botMove = empty[Math.floor(Math.random() * empty.length)];
        state.board[botMove] = "O";
        winner = checkWinner(state.board);
      }
    }

    if (winner === "X") state.status = "won";
    else if (winner === "O") state.status = "lost";
    else if (winner === "draw") state.status = "draw";
  }
}

// 4. Tạo huy hiệu thông báo trạng thái
let badge = "";
if (state.status === "won")
  badge =
    '<br><img src="https://img.shields.io/badge/Winner-You_Are_Pro!-gold?style=for-the-badge&logo=github">';
else if (state.status === "lost")
  badge =
    '<br><img src="https://img.shields.io/badge/Winner-Bot_Wins-red?style=for-the-badge">';
else if (state.status === "draw")
  badge =
    '<br><img src="https://img.shields.io/badge/Result-Draw-blue?style=for-the-badge">';

// 5. Render HTML bàn cờ
const renderCell = (v, i) =>
  v
    ? `<img src="https://placehold.co/50x50/21262d/${v === "X" ? "ff5555" : "55ff55"}/png?text=${v}" width="50">`
    : `<a href="https://github.com/${username}/${username}/issues/new?title=ttt|${i}"><img src="https://placehold.co/50x50/21262d/21262d.png" width="50"></a>`;

const boardHtml =
  `<table border="1" style="border-collapse: collapse; border-color: #30363d;"><tr>` +
  state.board
    .map(
      (v, i) =>
        `<td width="60" height="60" align="center">${renderCell(v, i)}</td>${(i + 1) % 3 === 0 ? "</tr>" + (i + 1 < 9 ? "<tr>" : "") : ""}`,
    )
    .join("") +
  `</table>${badge}`;

// 6. Ghi đè vào README.md an toàn
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, "utf8");
  if (
    readme.includes("<!-- BOARD_START -->") &&
    readme.includes("<!-- BOARD_END -->")
  ) {
    readme = readme.replace(
      /<!-- BOARD_START -->[\s\S]*<!-- BOARD_END -->/,
      `<!-- BOARD_START -->\n${boardHtml}\n<!-- BOARD_END -->`,
    );
    fs.writeFileSync(readmePath, readme);
  }
}

fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log("Cập nhật game thành công!");
