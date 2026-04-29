document.addEventListener("DOMContentLoaded", () => {

  // ================= NAVIGATION =================
  document.querySelectorAll("[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const link = btn.dataset.link;
      if (link) window.location.href = link;
    });
  });


  // ================= PLAY GAME =================
  const gameBtn = document.getElementById("playGameBtn");

  if (gameBtn) {
    gameBtn.onclick = () => {
      window.location.href = "game-setup.html";
    };
  }


  // ================= NOTIFICATION PANEL =================
  const notifBtn = document.querySelector(".notif-btn");
  const notifPanel = document.getElementById("notifPanel");
  const notifOverlay = document.getElementById("notifOverlay");

  if (notifBtn && notifPanel && notifOverlay) {

    // OPEN
    notifBtn.addEventListener("click", () => {
      notifPanel.classList.add("active");
      notifOverlay.classList.add("active");
    });

    // CLOSE
    notifOverlay.addEventListener("click", () => {
      notifPanel.classList.remove("active");
      notifOverlay.classList.remove("active");
    });
  }


  // ================= MARK NOTIFICATION READ =================
  document.querySelectorAll(".notification-item").forEach(item => {
    item.addEventListener("click", () => {
      item.classList.remove("unread");
    });
  });

});