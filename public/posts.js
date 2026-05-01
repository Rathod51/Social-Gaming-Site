document.addEventListener("DOMContentLoaded", () => {

  const postsGrid = document.querySelector(".posts-grid");
  const savedContainer = document.getElementById("saved");
  const postCountEl = document.querySelector(".post-count");

  let posts = JSON.parse(localStorage.getItem("posts")) || [];

  // ---------- RENDER POSTS ----------
  function renderPosts() {
    postsGrid.innerHTML = "";

    posts.forEach(post => {

      const div = document.createElement("div");
      div.className = "post-item";

      div.innerHTML = `
        <img src="${post.image || 'https://via.placeholder.com/300'}">

        <button class="save-btn ${post.saved ? "saved" : ""}">
          ${post.saved ? "★" : "☆"}
        </button>
      `;

      div.querySelector(".save-btn").onclick = (e) => {
        e.stopPropagation();

        post.saved = !post.saved;

        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
        renderSavedPosts();
      };

      postsGrid.appendChild(div);
    });

    // update post count
    if (postCountEl) postCountEl.textContent = posts.length;
  }

  // ---------- SAVED POSTS ----------
  function renderSavedPosts() {
    const savedPosts = posts.filter(p => p.saved);

    if (!savedPosts.length) {
      savedContainer.innerHTML = "<p style='text-align:center'>No saved posts yet</p>";
      return;
    }

    savedContainer.innerHTML = `
      <div class="posts-grid">
        ${savedPosts.map(post => `
          <div class="post-item">
            <img src="${post.image}">
          </div>
        `).join("")}
      </div>
    `;
  }

  renderPosts();
  renderSavedPosts();

});