// Week06 作業：猜數字遊戲（1–100）
// 電腦隨機產生 1~100，使用 prompt 猜，提示大小，猜中顯示次數

var answer = Math.floor(Math.random() * 100) + 1;
var times = 0;
var history = [];
var text = "=== 猜數字遊戲（1–100）===\n";

while (true) {
  var input = prompt("請輸入 1~100 的整數（取消結束）：");
  if (input === null) {           // 使用者按取消
    text += "\n你已取消遊戲。";
    break;
  }

  var n = parseInt(input, 10);

  if (isNaN(n) || n < 1 || n > 100) {
    alert("請輸入 1~100 的【整數】！");
    continue;
  }

  times++;
  history.push(n);

  if (n === answer) {
    text += "恭喜答對！答案是 " + answer + "\n";
    text += "總共猜了 " + times + " 次。\n";
    text += "你的猜測紀錄：[" + history.join(", ") + "]";
    alert("恭喜答對！共猜了 " + times + " 次。");
    break;
  } else if (n < answer) {
    alert("再大一點！");
  } else {
    alert("再小一點！");
  }
}

console.log(text);
document.getElementById("result").textContent = text;
