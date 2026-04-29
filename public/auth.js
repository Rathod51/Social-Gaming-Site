
// ...................... Auth Check ........................

document.addEventListener("DOMContentLoaded", () => {
  const protectedPages = ["home.html"];

  const currentPage = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage)) {
    const user = localStorage.getItem("user");

    if (!user) {
      window.location.href = "login.html";
    }
  }
});


// ....................Login Page Operation....................


const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.text();

    if (res.ok) {
      localStorage.setItem("user", email);
      window.location.href = "home.html";
    } else {
      alert(data);
    }
  });
}


// ....................Signup Page Operation....................


const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    const res = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.text();

    if (res.ok) {
      window.location.href = "login.html";
    } else {
      alert(data);
    }
  });
}
