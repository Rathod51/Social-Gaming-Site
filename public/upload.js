
//to upload

const uploadBtn = document.getElementById("uploadBtn");

if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    const text = document.getElementById("uploadText").value.trim();
    const file = document.getElementById("uploadImage").files[0];

    if (!text && !file) return;

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
        const imageURL = e.target.result; // permanent base64

        const newPost = {
        id: Date.now(),
        username: "You",
        text,
        image: imageURL,
        likes: 0,
        liked: false,
        comments: []
        };

        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.unshift(newPost);

        localStorage.setItem("posts", JSON.stringify(posts));

        // 👉 now safe to redirect
        window.location.href = "home.html";
      };

      reader.readAsDataURL(file);

      } else {
        const newPost = {
          id: Date.now(),
          username: "You",
          text,
          image: "",
          likes: 0,
          liked: false,
          comments: []
        };
        // save in localStorage

        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.unshift(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));
      // redirect to home

        window.location.href = "home.html";
      }
  });
}