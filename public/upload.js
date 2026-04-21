
//to upload

const uploadBtn = document.getElementById("uploadBtn");

if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    const text = document.getElementById("uploadText").value.trim();
    const file = document.getElementById("uploadImage").files[0];

    if (!text && !file) return;

    let imageURL = file ? URL.createObjectURL(file) : "";

    const newPost = {
      id: Date.now(),
      username: "You",
      text,
      image: imageURL,
      likes: 0,
      liked: false,
      comments: []
    };

    // save in localStorage
    const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    storedPosts.unshift(newPost);
    localStorage.setItem("posts", JSON.stringify(storedPosts));

    // redirect to home
    window.location.href = "home.html";
  });
}