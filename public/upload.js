// ================= SELECT ELEMENTS =================

const textInput = document.getElementById("uploadText");
const fileInput = document.getElementById("uploadImage");
const previewImg = document.getElementById("previewImg");
const postBtn = document.getElementById("postBtn");


// ================= IMAGE PREVIEW =================

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function () {
            previewImg.src = reader.result;
            previewImg.style.display = "block";
        };

        reader.readAsDataURL(file);
    } else {
        previewImg.style.display = "none";
    }
});


// ================= CREATE POST =================

postBtn.addEventListener("click", () => {

    const text = textInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    // if image exists → convert to base64
    if (file) {

        const reader = new FileReader();

        reader.onload = function () {
            savePost(reader.result);
        };

        reader.readAsDataURL(file);

    } else {
        savePost("");
    }

});


// ================= SAVE POST =================

function savePost(imageURL) {

    const newPost = {
        id: Date.now(),
        username: "You",
        text: textInput.value.trim(),
        image: imageURL,   // ✅ permanent image
        likes: 0,
        liked: false,
        comments: []
    };

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts.unshift(newPost);

    localStorage.setItem("posts", JSON.stringify(posts));

    // reset inputs
    textInput.value = "";
    fileInput.value = "";
    previewImg.style.display = "none";

    // go back to home
    window.location.href = "home.html";
}