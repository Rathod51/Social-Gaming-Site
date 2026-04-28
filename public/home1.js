const theme = localStorage.getItem("theme");

if (theme === "light") {
  document.body.classList.add("light-mode");
}

const btn = document.querySelector(".notif-btn");
const panel = document.getElementById("notifPanel");
const overlay = document.getElementById("notifOverlay");

// open
btn.addEventListener("click", () => {
  panel.classList.add("active");
  overlay.classList.add("active");
});

// close
overlay.addEventListener("click", () => {
  panel.classList.remove("active");
  overlay.classList.remove("active");
});