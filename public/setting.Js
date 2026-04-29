let user = JSON.parse(localStorage.getItem("user")) || {
  name: "Player",
  username: "@player",
  bio: "Write something about yourself...",
  gender: "",
  image: "default.png"
};

// LOAD DATA
document.getElementById("name").value = user.name;
document.getElementById("username").value = user.username;
document.getElementById("bio").value = user.bio;
document.getElementById("gender").value = user.gender || "";
document.getElementById("previewImg").src = user.image;

// IMAGE PREVIEW
document.getElementById("profileImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    document.getElementById("previewImg").src = reader.result;
    user.image = reader.result;
  };

  reader.readAsDataURL(file);
});

// SAVE
document.getElementById("saveProfile").onclick = () => {

  user.name = document.getElementById("name").value;
  user.username = document.getElementById("username").value;
  user.bio = document.getElementById("bio").value;
  user.gender = document.getElementById("gender").value;

  localStorage.setItem("user", JSON.stringify(user));

  alert("Profile Updated!");
};

// LOGOUT
document.getElementById("logout").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// LOAD THEME
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  document.getElementById("themeToggle").checked = true;
}

// TOGGLE THEME
document.getElementById("themeToggle").addEventListener("change", (e) => {

  if (e.target.checked) {
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
  }

});