//............unread chats(badge)...............

let unreadCount = parseInt(localStorage.getItem("unreadCount")) || 0;

//...........show badge...................

const chatBadge = document.getElementById("chatBadge");

function updateBadge() {
  if (!chatBadge) return;

  if (unreadCount > 0) {
    chatBadge.style.display = "inline-block";
    chatBadge.textContent = unreadCount;
  } else {
    chatBadge.style.display = "none";
  }
}
updateBadge();

//..................increase badge (new message)................
function receiveMessage() {
  unreadCount++;
  localStorage.setItem("unreadCount", unreadCount);
  updateBadge();
}

//...................reset badge when user opens chat....................

document.querySelector('[data-link="chat.html"]')?.addEventListener("click", () => {
  unreadCount = 0;
  localStorage.setItem("unreadCount", unreadCount);
});

//.................real time messages..............





//..............create posts..................

const posts = [
  {
    id: 1,
    username: "PlayerOne",
    text: "Just won my chess match ♟️🔥",
    likes: 0,
    comments: []
  },
  {
    id: 2,
    username: "ProGamer",
    text: "New high score 🚀",
    likes: 2,
    comments: ["Nice!", "GG"]
  }
];

//.....................to render a post......................
function renderPosts() {
  const feed = document.querySelector(".feed");
  feed.innerHTML = "";

  posts.forEach(post => {
    feed.innerHTML += `
      <div class="post" data-id="${post.id}">

        <div class="post-header">
          <img src="https://i.pravatar.cc/40">
          <span class="username">${post.username}</span>
        </div>

        <p class="post-text">${post.text}</p>

        <div class="post-actions">

          <button class="icon-btn like-btn">
            <i class="fa-regular fa-heart"></i>
          </button>
          <span class="like-count">${post.likes}</span>

          <button class="icon-btn comment-btn">
            <i class="fa-regular fa-comment"></i>
          </button>

        </div>

        <div class="comment-section" style="display:none;">
          <div class="comment-list">
            ${post.comments.map(c => `<div>${c}</div>`).join("")}
          </div>

          <input class="comment-input" placeholder="Write comment">
          <button class="post-comment-btn">Post</button>
        </div>

      </div>
    `;
  });
}

renderPosts();


//.................Add interaction (like and comment).........................

document.addEventListener("click", (e) => {

  // LIKE
  if (e.target.closest(".like-btn")) {
    const postEl = e.target.closest(".post");
    const id = postEl.dataset.id;

    const post = posts.find(p => p.id == id);
    post.likes++;

    renderPosts();
  }
  // fill when clicked
  if (e.target.closest(".like-btn")) {
  const btn = e.target.closest(".like-btn");
  const icon = btn.querySelector("i");

  icon.classList.toggle("fa-regular");
  icon.classList.toggle("fa-solid");
}

  // TOGGLE COMMENT
  if (e.target.closest(".comment-btn")) {
    const section = e.target.closest(".post").querySelector(".comment-section");

    section.style.display =
      section.style.display === "none" ? "block" : "none";
  }

  // ADD COMMENT
  if (e.target.closest(".post-comment-btn")) {
    const postEl = e.target.closest(".post");
    const id = postEl.dataset.id;

    const input = postEl.querySelector(".comment-input");
    const text = input.value.trim();

    if (!text) return;

    const post = posts.find(p => p.id == id);
    post.comments.push(text);

    renderPosts();
  }

});