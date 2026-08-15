const fs = require("fs");

const issueTitle = process.argv[2];
const username = "TogPam"; // Tên repo của bạn

if (!issueTitle || !issueTitle.startsWith("ttt|")) {
  console.log("Không phải lệnh đánh cờ. Bỏ qua.");
  process.exit(0);
}

const moveIndex = parseInt(issueTitle.split("|")[1]);
const statePath = "./state.json";
const readmePath = "./README.md";

let state = JSON.parse(fs.readFileSync(statePath, "utf8"));

if (state.status !== "playing") {
  state.board = [null, null, null, null, null, null, null, null, null];
  state.status = "playing";
}

if (state.board[moveIndex] === null) {
  state.board[moveIndex] = "X";
} else {
  console.log("Ô này đã được đánh!");
  process.exit(0);
}

const emptyIndices = state.board
  .map((val, idx) => (val === null ? idx : null))
  .filter((val) => val !== null);
if (emptyIndices.length > 0) {
  const randomMove =
    emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  state.board[randomMove] = "O";
}

const getCellHtml = (val, index) => {
  const emptyImg = `https://placehold.co/50x50/21262d/21262d.png`;
  const xImg = `https://placehold.co/50x50/21262d/ff5555/png?text=X`; // Chữ X màu đỏ
  const oImg = `https://placehold.co/50x50/21262d/55ff55/png?text=O`; // Chữ O màu xanh

  if (val === "X") return `<img src="${xImg}" width="50">`;
  if (val === "O") return `<img src="${oImg}" width="50">`;
  return `<a href="https://github.com/${username}/${username}/issues/new?title=ttt|${index}"><img src="${emptyImg}" width="50"></a>`;
};

// QUAN TRỌNG: Các dòng dưới đây phải viết sát lề trái, tuyệt đối không dùng dấu cách hay tab ở đầu dòng!
const newBoardHtml = `<table border="1" style="border-collapse: collapse; border-color: #30363d;">
<tr>
<td width="60" height="60" align="center">${getCellHtml(state.board[0], 0)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[1], 1)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[2], 2)}</td>
</tr>
<tr>
<td width="60" height="60" align="center">${getCellHtml(state.board[3], 3)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[4], 4)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[5], 5)}</td>
</tr>
<tr>
<td width="60" height="60" align="center">${getCellHtml(state.board[6], 6)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[7], 7)}</td>
<td width="60" height="60" align="center">${getCellHtml(state.board[8], 8)}</td>
</tr>
</table>`;

let readme = fs.readFileSync(readmePath, "utf8");
const startTag = "<!-- BOARD_START -->";
const endTag = "<!-- BOARD_END -->";

const beforeBoard = readme.substring(
  0,
  readme.indexOf(startTag) + startTag.length,
);
const afterBoard = readme.substring(readme.indexOf(endTag));

fs.writeFileSync(
  readmePath,
  beforeBoard + "\n" + newBoardHtml + "\n" + afterBoard,
);
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

console.log("Đã cập nhật bàn cờ thành công!");
