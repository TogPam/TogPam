const fs = require('fs');

// Lấy tham số truyền vào từ GitHub Actions (VD: "ttt|4")
const issueTitle = process.argv[2]; 
const username = "TogPam"; // ĐIỀN USERNAME CỦA BẠN VÀO ĐÂY

if (!issueTitle || !issueTitle.startsWith('ttt|')) {
    console.log('Không phải lệnh đánh cờ. Bỏ qua.');
    process.exit(0);
}

const moveIndex = parseInt(issueTitle.split('|')[1]);
const statePath = './state.json';
const readmePath = './README.md';

// 1. Đọc trạng thái bàn cờ
let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

// Nếu game đã kết thúc (thắng/hòa), reset lại bàn cờ mới
if (state.status !== 'playing') {
    state.board = [null, null, null, null, null, null, null, null, null];
    state.status = 'playing';
}

// 2. Ghi nhận nước đi của Người dùng (X)
if (state.board[moveIndex] === null) {
    state.board[moveIndex] = 'X';
} else {
    console.log('Ô này đã được đánh!');
    process.exit(0);
}

// 3. Logic của Bot (O) - Đánh ngẫu nhiên vào ô trống
const emptyIndices = state.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
if (emptyIndices.length > 0) {
    const randomMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    state.board[randomMove] = 'O';
}

// 4. Sinh ra giao diện (HTML) bàn cờ mới
const getCellHtml = (val, index) => {
    const emptyImg = `https://via.placeholder.com/50/0d1117/0d1117`;
    const xImg = `https://via.placeholder.com/50/0d1117/ff5555?text=X`; // Ô X màu đỏ
    const oImg = `https://via.placeholder.com/50/0d1117/55ff55?text=O`; // Ô O màu xanh lá
    
    if (val === 'X') return `<img src="${xImg}" width="50">`;
    if (val === 'O') return `<img src="${oImg}" width="50">`;
    return `<a href="https://github.com/${username}/${username}/issues/new?title=ttt|${index}"><img src="${emptyImg}" width="50"></a>`;
};

const newBoardHtml = `
            <table border="1" style="border-collapse: collapse; border-color: #30363d;">
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
            </table>
`;

// 5. Cập nhật README.md
let readme = fs.readFileSync(readmePath, 'utf8');
const startTag = '<!-- BOARD_START -->';
const endTag = '<!-- BOARD_END -->';

const beforeBoard = readme.substring(0, readme.indexOf(startTag) + startTag.length);
const afterBoard = readme.substring(readme.indexOf(endTag));

fs.writeFileSync(readmePath, beforeBoard + '\n' + newBoardHtml + '\n            ' + afterBoard);

// 6. Lưu lại trạng thái
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log('Đã cập nhật bàn cờ thành công!');

