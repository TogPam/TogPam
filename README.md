<!-- Bọc toàn bộ trong một Table để kiểm soát kích thước -->
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <!-- HEADER: Dạng App Card bo góc (Bạn có thể tự thiết kế 1 ảnh bìa xịn xò chèn vào đây) -->
      <img src="https://via.placeholder.com/800x200/282c34/61afef?text=Welcome+to+My+Interactive+Dashboard" alt="Header" width="800">
    </td>
  </tr>
  <tr>
    <td align="center">
      <!-- BODY: Chia làm 2 cột -->
      <table border="0" cellpadding="20" cellspacing="0" width="800">
        <tr>
          <!-- CỘT TRÁI: Thống kê & Tech Stack (Widget) -->
          <td width="40%" valign="top">
            <h3>⚡ Current Status</h3>
            <img src="https://github-readme-stats.vercel.app/api?username=TogPam&theme=tokyonight&show_icons=true" alt="Stats" width="100%">
            <br><br>
            <h3>🛠️ Tech Stack</h3>
            <!-- Chèn các icon ngôn ngữ lập trình dạng badge nhỏ -->
            <img src="https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=Node.js&logoColor=white">
            <img src="https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=Python&logoColor=white">
          </td>

          <!-- CỘT PHẢI: KHU VỰC CHƠI GAME (Tic-Tac-Toe Widget) -->
          <td width="60%" align="center" valign="top" style="background-color: #f6f8fa; border-radius: 10px;">
            <h3>🎮 Let's play Tic-Tac-Toe!</h3>
            <p>Click into an empty cell to make your move (X).</p>
            
            <!-- Bàn cờ (Được Script tự động sinh ra/thay đổi) -->
            <!-- VÍ DỤ CẤU TRÚC 1 HÀNG -->
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <td><a href="https://github.com/TEN_CUA_BAN/TEN_CUA_BAN/issues/new?title=ttt|move|0,0"><img src="link_anh_o_trong.png" width="80"></a></td>
                <td><a href="#"><img src="link_anh_X.png" width="80"></a></td>
                <td><a href="https://github.com/TEN_CUA_BAN/TEN_CUA_BAN/issues/new?title=ttt|move|0,2"><img src="link_anh_O.png" width="80"></a></td>
              </tr>
              <!-- Hàng 2, Hàng 3 tương tự -->
            </table>
            
            <p><i>Powered by GitHub Actions 🤖</i></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
