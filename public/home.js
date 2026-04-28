

const theme = localStorage.getItem("theme");

if (theme === "light") {
  document.body.classList.add("light-mode");
}


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

// still one function is remaining for real time notify








function savePosts() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

function loadPosts() {
  return JSON.parse(localStorage.getItem("posts")) || [];
}

let posts = loadPosts();


//..............to create posts..................
function createPost(text, imageURL) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [
  {
    id: 1,
    username: "PlayerOne",
    text: "Just won my chess match ♟️🔥",
    image: "https://picsum.photos/600/300",
    likes: 5,
    liked: false,
    comments: ["Nice!", "GG"]
  },
  {
    id: 2,
    username: "ProGamer",
    text: "Top score today 🚀",
    image: "https://picsum.photos/600/301",
    likes: 12,
    liked: false,
    comments: []
  },
  {
    id: 3,
    username: "NoobMaster",
    text: "Learning new tricks 😎",
    image: "",
    likes: 2,
    liked: false,
    comments: []
  }
];

    posts.unshift(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

 console.log(posts);
//.....................to render a post......................

function renderPosts() {
  const feed = document.querySelector(".feed");
  feed.innerHTML = "";

  posts.forEach(post => {
    feed.innerHTML += `
      <div class="post" data-id="${post.id}">

        <div class="post-header">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="https://i.pravatar.cc/40">
                <div>
                    <span class="username">${post.username}</span>
                    <div class="post-time">2 hours ago</div>
                </div> 
                <button class="post-options-btn">
                  <i    class="fa-solid fa-ellipsis"></i>
                </button>

              <div class="post-menu">
                <div class="post-menu-item">Add to Highlightes</div>
                <div class="post-menu-item">Go to Account</div>
                <div class="post-menu-item">Copy link</div>
                <div class="post-menu-item">Share</div>
                <div class="post-menu-item">Report</div>
              </div>
            </div>
          </div>
    

        <p class="post-text">${post.text}</p>

         ${post.image ? `<img src="${post.image}" class="post-img">` : ""}

        <div class="post-actions">
            <div class="left-actions">
                <button class="like-btn">
                    <i class="${post.liked ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>
                <span class="like-count">${post.likes}</span>


                <button class="icon-btn comment-btn">
                    <i class="fa-regular fa-comment"></i>
                </button>
            </div>    
        </div>

        <div class="comment-section" style="display:none;">
            <div class="comment-list">
                  ${post.comments.map(c => `<div class="comment-item">${c}</div>`).join("")}
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

// open menu
    if (e.target.closest(".post-options-btn")) {
        const post = e.target.closest(".post");
        const menu = post.querySelector(".post-menu");

        menu.classList.toggle("active");
    }

// close when clicking outside
    document.querySelectorAll(".post-menu").forEach(menu => {
        if (!menu.contains(e.target) && !e.target.closest(".post-options-btn")) {
        menu.classList.remove("active");
        }
    });

//LIKE
    if (e.target.closest(".like-btn")) {
        const postEl = e.target.closest(".post");
        const id = postEl.dataset.id;

        const post = posts.find(p => p.id == id);
        
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;

        savePosts();
        renderPosts();
    }

//.................. TOGGLE COMMENT ............................

    if (e.target.closest(".comment-btn")) {
        const section = e.target.closest(".post").querySelector(".comment-section");

        section.style.display =
        section.style.display === "none" ? "block" : "none";
    }

//.................... ADD COMMENT .........................

    if (e.target.closest(".post-comment-btn")) {
        const postEl = e.target.closest(".post");
        const id = postEl.dataset.id;

        const input = postEl.querySelector(".comment-input");
        const text = input.value.trim();

        if (!text) return;

        const post = posts.find(p => p.id == id);
        post.comments.push(text);

        savePosts();
        renderPosts();
    }

    });