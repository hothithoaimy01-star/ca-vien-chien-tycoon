let money = 0;
let state = "empty"; // empty -> cooking -> cooked -> sauced

const pan = document.getElementById('pan');
const panStatus = document.getElementById('pan-status');
const moneyTxt = document.getElementById('money');
const speechText = document.getElementById('speech-text');

const btnCook = document.getElementById('btn-cook');
const btnSauce = document.getElementById('btn-sauce');
const btnServe = document.getElementById('btn-serve');

const dialogues = [
  '"Chú Ba ơi, chiên cho con xiên cá viên giòn giòn, chan nhiều mắm tắc nghen!"',
  '"Cho con xiên bò viên đậm vị nha chú, tan học đói bụng quá chừng!"',
  '"Chú Ba chiên lẹ lẹ nghen, con sắp vô tiết học rồi đó!"'
];

function cook() {
  if (state !== "empty") return;

  state = "cooking";
  panStatus.innerText = "🔥 Đang chiên xèo xèo... (2s)";
  pan.style.background = "#d84315";
  btnCook.disabled = true;

  setTimeout(() => {
    state = "cooked";
    panStatus.innerText = "🍢 Cá viên chín vàng rộm!";
    pan.style.background = "#f57c00";
    btnSauce.disabled = false;
  }, 2000);
}

function addSauce() {
  if (state !== "cooked") return;

  state = "sauced";
  panStatus.innerText = "🌶️ Đã chan mắm tắc chua ngọt!";
  pan.style.background = "#bf360c";
  btnSauce.disabled = true;
  btnServe.disabled = false;
}

function serve() {
  if (state !== "sauced") return;

  money += 5000;
  moneyTxt.innerText = money.toLocaleString('vi-VN');

  // Reset chảo
  state = "empty";
  panStatus.innerText = "🍳 Chảo dầu đang trống";
  pan.style.background = "#3e2723";

  btnCook.disabled = false;
  btnSauce.disabled = true;
  btnServe.disabled = true;

  // Đổi lời thoại học sinh ngẫu nhiên
  const nextDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
  speechText.innerText = nextDialogue;
}