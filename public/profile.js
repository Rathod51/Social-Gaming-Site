document.addEventListener("DOMContentLoaded", () => {

  // ================= USER =================

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    localStorage.removeItem("user");
    user = {};
  }
  const nameEl = document.querySelector(".name"); 
  const usernameEl = document.querySelector(".username");
  const bioEl = document.querySelector(".bio");
  const imgEl = document.querySelector(".profile-img-large");
  
  //FIXED USERNAME

  if (nameEl) {
    nameEl.textContent = user.name || "Player";
  }
  
  if (usernameEl) {
    usernameEl.textContent = "@" + (user.username || "username");
  }
  
  if (bioEl) {
    bioEl.textContent = user.bio || "";
  }

  if (imgEl) {
    imgEl.src = user.image || "https://i.pravatar.cc/150";
  }
  
  
  //================ EDIT PROFILE =================
  const btn = document.getElementById("editProfileBtn");
    if (btn) {
      btn.onclick = () => {
        window.location.href = "settings.html";
      };
    }

  // ================= POST COUNT =================
  const postCountEl = document.querySelector(".post-count");

  function getPosts() {
    try {
      return JSON.parse(localStorage.getItem("posts")) || [];
    } catch {
      localStorage.removeItem("posts");
      return [];
    }
  }

  const posts = getPosts();
  if (postCountEl) postCountEl.textContent = posts.length;


  // ================= MENU SYSTEM =================

  const menuBtn = document.getElementById("menuBtn");
  const menuDropdown = document.getElementById("menuDropdown");

  if (menuBtn  && menuDropdown) {
    menuBtn.onclick = () => {
      menuDropdown.classList.toggle("active");
    };
  }

  document.querySelectorAll(".menu-item").forEach(item => {
    item.onclick = () => {

      document.querySelectorAll(".content-section")
        .forEach(sec => sec.classList.remove("active"));

      document.getElementById(item.dataset.target)
        .classList.add("active");

      menuDropdown.classList.remove("active");
    };
  });


  // ================= HIGHLIGHTS =================

  const highlightContainer = document.querySelector(".highlights");

  let highlights = [];
  try {
    highlights = JSON.parse(localStorage.getItem("highlights")) || [];
  } catch {
    localStorage.removeItem("highlights");
    highlights = [];
  }

  highlights = highlights.map(h => {
    if (!h.stories) {
      return {
        title: h.title || "Untitled",
        stories: [{
          id: Date.now(),
          content: h.content || "",
          image: h.image || ""
        }]
      };
    }
    return h;
  });

  localStorage.setItem("highlights", JSON.stringify(highlights));

  function renderHighlights() {

    if (!highlightContainer) return;

    highlightContainer.innerHTML = `
      <div class="highlight-item add-highlight" id="addHighlight">
        <div class="circle">+</div>
        <p>Add</p>
      </div>
    `;

    highlights.forEach((h, index) => {

      // REMOVE EMPTY HIGHLIGHTS
      if (!h.stories || h.stories.length === 0) return;

      const div = document.createElement("div");
      div.className = "highlight-item";

      const thumb = h.stories[0]?.image || "";

      div.innerHTML = `
        <div class="circle">
          ${thumb ? `<img src="${thumb}" class="highlight-img">` : ""}
        </div>
      `;

      div.onclick = () => {
        openStory(index, 0, highlights, renderHighlights);
      };

      highlightContainer.appendChild(div);
    });

    const addBtn = document.getElementById("addHighlight");
    if (addBtn) addBtn.onclick = openCreateModal;
  }


  function openCreateModal() {

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="modal-card">
        <h3>Create Highlight</h3>

        <input id="title" placeholder="Highlight title"/>
        <textarea id="content" placeholder="Story content"></textarea>
        <input type="file" id="img"/>

        <div class="modal-actions">
          <button id="save">Save</button>
          <button id="cancel">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("cancel").onclick = () => overlay.remove();

    document.getElementById("save").onclick = () => {

      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();
      const file = document.getElementById("img").files[0];

      if (!title) return;

      const newHighlight = {
        id: Date.now(),
        title,
        stories: []
      };

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          newHighlight.stories.push({
            id: Date.now(),
            content,
            image: reader.result
          });

          highlights.push(newHighlight);
          localStorage.setItem("highlights", JSON.stringify(highlights));

          overlay.remove();
          renderHighlights();
        };

        reader.readAsDataURL(file);

      } else {
        newHighlight.stories.push({
          id: Date.now(),
          content,
          image: ""
        });

        highlights.push(newHighlight);
        localStorage.setItem("highlights", JSON.stringify(highlights));

        overlay.remove();
        renderHighlights();
      }
    };
  }

  renderHighlights();


  // ================= POSTS =================

  const postContainer = document.querySelector(".posts-grid");

  function renderPosts(filteredPosts = null) {

    if (!postContainer) return;

    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem("posts")) || [];
    } catch {
      localStorage.removeItem("posts");
      posts = [];
    }

    const displayPosts = filteredPosts || posts;

    postContainer.innerHTML = "";

    displayPosts.forEach((post, index) => {

      const div = document.createElement("div");
      div.className = "post-item";

      div.innerHTML = `
        ${post.image ? `<img src="${post.image}">` : ""}
      `;

      div.onclick = () => openPost(index, displayPosts);

      postContainer.appendChild(div);
    });
  }


  function openPost(index, posts) {

    const post = posts[index];

    const overlay = document.createElement("div");
    overlay.className = "story-overlay";

    overlay.innerHTML = `
      <div class="story-view">

        <button class="story-close">✕</button>

        ${post.image ? `<img src="${post.image}" class="story-img-full">` : ""}

        <div class="story-overlay-text">
          <p>${post.text || ""}</p>
          <p>❤️ ${post.likes || 0}</p>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".story-close").onclick = () => {
      overlay.remove();
    };
  }

  renderPosts();


  // ================= SEARCH =================

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", () => {

      const value = searchInput.value.toLowerCase();

      let posts = JSON.parse(localStorage.getItem("posts")) || [];

      const filtered = posts.filter(p =>
        p.text?.toLowerCase().includes(value)
      );

      renderPosts(filtered);
    });
  }

});