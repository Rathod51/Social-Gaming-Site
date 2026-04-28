
const theme = localStorage.getItem("theme");

  if (theme === "light") {
    document.body.classList.add("light-mode");
}

const notifBtn = document.querySelector(".notif-btn");
const panel = document.getElementById("notifPanel");
const overlay = document.getElementById("notifOverlay");

// open panel
notifBtn?.addEventListener("click", (e) => {
  e.preventDefault(); // stop page redirect

  panel.classList.add("active");
  overlay.classList.add("active");
});

// close when clicking outside
overlay.addEventListener("click", () => {
  panel.classList.remove("active");
  overlay.classList.remove("active");
});

//..........for Notification...................


const notifBtn = document.querySelector(".notif-btn");
const panel = document.getElementById("notifPanel");
const overlay = document.getElementById("notifOverlay");

if (notifBtn && panel && overlay) {
  notifBtn.addEventListener("click", (e) => {
    e.preventDefault();
    panel.classList.add("active");
    overlay.classList.add("active");

    // mark all as read when opening panel
    markAllNotificationsRead();
    updateNotifBadge();
  });
}

overlay?.addEventListener("click", closePanel);

panel?.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePanel();
});

function closePanel() {
  panel.classList.remove("active");
  overlay.classList.remove("active");
}



//...................... notification data helper .........................

function getNotifications() {
  return JSON.parse(localStorage.getItem("notifications")) || [];
}

function saveNotifications(list) {
  localStorage.setItem("notifications", JSON.stringify(list));
}

function addNotification(type, message) {
  const list = getNotifications();

  list.unshift({
    id: Date.now(),
    type,
    message,
    time: new Date().toLocaleString(),
    read: false
  });

  saveNotifications(list);
  updateNotifBadge();
}

function markAllNotificationsRead() {
  const list = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(list);
}

function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length;
}

const notifBadge = document.getElementById("notifBadge");

function updateNotifBadge() {
  if (!notifBadge) return;

  const count = getUnreadCount();

  if (count > 0) {
    notifBadge.style.display = "flex";
    notifBadge.textContent = count;
  } else {
    notifBadge.style.display = "none";
  }
}

// .................badge logic.......................
const notifBadge = document.getElementById("notifBadge");

function updateNotifBadge() {
  if (!notifBadge) return;

  const count = getUnreadCount();

  if (count > 0) {
    notifBadge.style.display = "flex";
    notifBadge.textContent = count;
  } else {
    notifBadge.style.display = "none";
  }
}

// run on load
updateNotifBadge();