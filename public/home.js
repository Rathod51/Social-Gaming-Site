
// ===============================
// USER DATA
// ==============================
// ===============================
// SAFE USER DATA
// ===============================

let currentUser = {
    name: "Player",
    username: "player",
    image: "https://i.pravatar.cc/150"
};

try {

    const savedUser =
        localStorage.getItem("user");

    if (savedUser) {

        const parsed =
            JSON.parse(savedUser);

        currentUser = {
            ...currentUser,
            ...parsed
        };
    }

} catch (err) {

    console.log("Broken user data removed");

    localStorage.removeItem("user");
}



// ===============================
// CHAT BADGE
// ===============================

let unreadCount =
    parseInt(localStorage.getItem("unreadCount")) || 0;

const chatBadge =
    document.getElementById("chatBadge");

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

document
.querySelector('[data-link="chat.html"]')
?.addEventListener("click", () => {

    unreadCount = 0;

    localStorage.setItem(
        "unreadCount",
        unreadCount
    );

    updateBadge();
});

// ===============================
// POSTS STORAGE
// ===============================

function loadPosts() {

    try {

        const data = JSON.parse(
            localStorage.getItem("posts")
        );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];
    }
}

let posts = loadPosts();

function savePosts() {

    localStorage.setItem(
        "posts",
        JSON.stringify(posts)
    );
}

// ===============================
// DEMO POST
// ===============================

if (posts.length === 0) {

    posts.push({

        id: Date.now(),

        username: currentUser.username,

        userImage: currentUser.image,

        text: "Welcome to GameHub 🎮",

        image: "https://picsum.photos/700/500",

        likes: 0,

        liked: false,

        comments: []
    });

    savePosts();
}

// ===============================
// RENDER POSTS
// ===============================

function renderPosts() {

    const feed =
        document.querySelector(".feed");

    if (!feed) return;

    feed.innerHTML = "";

    posts.forEach(post => {

        const html = `

        <div class="post" data-id="${post.id}">

            <div class="post-header">

                <div style="display:flex;align-items:center;gap:10px;">

                    <img
                        src="${post.userImage || 'https://i.pravatar.cc/150'}"
                    >

                    <div>

                        <span class="username">
                            ${post.username || "player"}
                        </span>

                        <div class="post-time">
                            2 hours ago
                        </div>

                    </div>

                </div>

                <button class="post-options-btn">
                    <i class="fa-solid fa-ellipsis"></i>
                </button>

                <div class="post-menu">

                    <div class="post-menu-item add-highlight">
                        Add to Highlights
                    </div>

                    <div class="post-menu-item goto-profile">
                        Go to Account
                    </div>

                    <div class="post-menu-item copy-link">
                        Copy Link
                    </div>

                    <div class="post-menu-item share-post">
                        Share
                    </div>

                    <div class="post-menu-item report-post">
                        Report
                    </div>

                </div>

            </div>

            <p class="post-text">
                ${post.text || ""}
            </p>

            ${post.image
                ? `
                <img
                    src="${post.image}"
                    class="post-img"
                >
                `
                : ""
            }

            <div class="post-actions">

                <div class="left-actions">

                    <button class="like-btn">

                        <i class="${post.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>

                    </button>

                    <span class="like-count">
                        ${post.likes || 0}
                    </span>

                    <button class="comment-btn">

                        <i class="fa-regular fa-comment"></i>

                    </button>

                </div>

            </div>

            <div
                class="comment-section"
                style="display:none;"
            >

                <div class="comment-list">

                    ${(post.comments || []).map(c => `
                        <div class="comment-item">
                            ${c}
                        </div>
                    `).join("")}

                </div>

                <input
                    class="comment-input"
                    placeholder="Write comment"
                >

                <button class="post-comment-btn">
                    Post
                </button>

            </div>

        </div>
        `;

        feed.insertAdjacentHTML(
            "beforeend",
            html
        );
    });
}

renderPosts();

// ===============================
// POST INTERACTIONS
// ===============================

document.addEventListener("click", (e) => {

    const postEl =
        e.target.closest(".post");

    // ===========================
    // OPEN MENU
    // ===========================

    if (e.target.closest(".post-options-btn")) {

        const menu =
            postEl.querySelector(".post-menu");

        document
        .querySelectorAll(".post-menu")
        .forEach(m => {

            if (m !== menu) {
                m.classList.remove("active");
            }
        });

        menu.classList.toggle("active");
    }

    // ===========================
    // CLOSE MENU
    // ===========================

    if (
        !e.target.closest(".post-menu") &&
        !e.target.closest(".post-options-btn")
    ) {

        document
        .querySelectorAll(".post-menu")
        .forEach(menu => {

            menu.classList.remove("active");
        });
    }

    // ===========================
    // LIKE
    // ===========================

    if (e.target.closest(".like-btn")) {

        const id =
            postEl.dataset.id;

        const post =
            posts.find(
                p => p.id == id
            );

        if (!post) return;

        post.liked = !post.liked;

        post.likes +=
            post.liked ? 1 : -1;

        if (post.likes < 0) {
            post.likes = 0;
        }

        savePosts();

        const icon =
            postEl.querySelector(".like-btn i");

        const count =
            postEl.querySelector(".like-count");

        icon.className =
            `${post.liked ? 'fa-solid' : 'fa-regular'} fa-heart`;

        count.textContent =
            post.likes;
    }

    // ===========================
    // TOGGLE COMMENTS
    // ===========================

    if (e.target.closest(".comment-btn")) {

        const section =
            postEl.querySelector(".comment-section");

        section.style.display =
            section.style.display === "none"
            ? "block"
            : "none";
    }

    // ===========================
    // ADD COMMENT
    // ===========================

    if (e.target.closest(".post-comment-btn")) {

        const input =
            postEl.querySelector(".comment-input");

        const text =
            input.value.trim();

        if (!text) return;

        const id =
            postEl.dataset.id;

        const post =
            posts.find(
                p => p.id == id
            );

        if (!post) return;

        post.comments.push(text);

        savePosts();

        renderPosts();
    }

    // ===========================
    // ADD TO HIGHLIGHTS
    // ===========================

    if (e.target.closest(".add-highlight")) {

        const id =
            postEl.dataset.id;

        const post =
            posts.find(
                p => p.id == id
            );

        if (!post) return;

        let highlights =
            JSON.parse(
                localStorage.getItem("highlights")
            ) || [];

        highlights.push({

            title:
                post.text || "Highlight",

            stories: [

                {
                    image: post.image || "",
                    content: post.text || ""
                }
            ]
        });

        localStorage.setItem(
            "highlights",
            JSON.stringify(highlights)
        );

        alert("Added to highlights");
    }

    // ===========================
    // GO TO PROFILE
    // ===========================

    if (e.target.closest(".goto-profile")) {

        window.location.href =
            "profile.html";
    }

    // ===========================
    // COPY LINK
    // ===========================

    if (e.target.closest(".copy-link")) {

        navigator.clipboard.writeText(
            `post-${postEl.dataset.id}`
        );

        alert("Link copied");
    }

    // ===========================
    // SHARE
    // ===========================

    if (e.target.closest(".share-post")) {

        alert("Post shared");
    }

    // ===========================
    // REPORT
    // ===========================

    if (e.target.closest(".report-post")) {

        alert("Post reported");
    }
});

// ===============================
// TOP 50 PLAYERS
// ===============================

const topPlayersBtn =
    document.getElementById("topPlayersBtn");

if (topPlayersBtn) {

    topPlayersBtn.addEventListener("click", () => {

        let players = [];

        for (let i = 1; i <= 50; i++) {

            players.push({

                rank: i,

                username:
                    "player_" + i,

                score:
                    Math.floor(
                        Math.random() * 5000
                    ),

                winRate:
                    Math.floor(
                        Math.random() * 100
                    ),

                image:
                    "https://i.pravatar.cc/150?img=" + i
            });
        }

        players.sort(
            (a, b) =>
                b.winRate - a.winRate
        );

        openTopPlayers(players);
    });
}

// ===============================
// TOP PLAYERS MODAL
// ===============================

function openTopPlayers(players) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "top-player-overlay";

    overlay.innerHTML = `

    <div class="top-player-modal">

        <div class="top-player-header">

            <h2>Top 50 Players</h2>

            <button class="close-top-players">
                ✕
            </button>

        </div>

        <div class="top-player-list">

            ${players.map(player => `

                <div class="player-row">

                    <div class="player-left">

                        <span class="rank">
                            #${player.rank}
                        </span>

                        <img src="${player.image}">

                        <span>
                            ${player.username}
                        </span>

                    </div>

                    <div class="player-right">

                        <span>
                            🏆 ${player.score}
                        </span>

                        <span>
                            🎯 ${player.winRate}%
                        </span>

                    </div>

                </div>

            `).join("")}

        </div>

    </div>
    `;

    document.body.appendChild(overlay);

    overlay
    .querySelector(".close-top-players")
    .onclick = () => {

        overlay.remove();
    };
}
