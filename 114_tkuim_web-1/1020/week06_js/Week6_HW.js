// Week06 作業：溫度轉換器（C ↔ F）
// 使用 var 與基本字串串接

var unit = prompt("請輸入單位（C 或 F）：");
if (unit) unit = unit.trim().toUpperCase();

var msg = "";

if (unit !== "C" && unit !== "F") {
  msg = "單位輸入錯誤，請重新整理後輸入 C 或 F。";
  alert(msg);
  document.getElementById("result").textContent = msg;
} else {
  var tStr = prompt("請輸入溫度數值：");
  var tNum = parseFloat(tStr);

  if (isNaN(tNum)) {
    msg = "溫度不是有效數字，請重新整理後再試。";
    alert(msg);
    document.getElementById("result").textContent = msg;
  } else {
    if (unit === "C") {
      // F = C * 9 / 5 + 32
      var f = tNum * 9 / 5 + 32;
      msg = "輸入：" + tNum + " °C\n轉換為：" + f.toFixed(2) + " °F";
    } else {
      // C = (F - 32) * 5 / 9
      var c = (tNum - 32) * 5 / 9;
      msg = "輸入：" + tNum + " °F\n轉換為：" + c.toFixed(2) + " °C";
    }
    alert(msg);
    document.getElementById("result").textContent = msg;
  }
}
