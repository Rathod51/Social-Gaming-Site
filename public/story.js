function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function openStory(hIndex, sIndex, highlights, renderHighlights) {

  const highlight = highlights[hIndex];
  const story = highlight.stories[sIndex];

  const overlay = document.createElement("div");
  overlay.className = "story-overlay";
  document.body.style.overflow = "hidden";

  let timer = null;
  let isPaused = false;

  // ---------- ADD VIEW ----------
  const currentUser = "You";
  if (!story.views) story.views = [];
  if (!story.views.includes(currentUser)) {
    story.views.push(currentUser);
    localStorage.setItem("highlights", JSON.stringify(highlights));
  }

  overlay.innerHTML = `
    <button class="story-close">✕</button>

    <div class="story-view">

      <div class="story-progress"></div>

      <div class="story-header">

        <img src="https://i.pravatar.cc/40" class="story-avatar">

        <div class="story-user">
          <span class="story-username">You</span>
          <span class="story-time">${formatTime(story.id)}</span>
        </div>

        <div class="story-controls">
          <button class="pause-btn">⏸</button>

          <div class="story-menu">
            <button class="menu-btn">⋯</button>

            <div class="menu-dropdown">
              <div class="menu-item delete">Delete</div>
              <div class="menu-item cancel">Cancel</div>
            </div>
          </div>
        </div>

      </div>

      ${story.image ? `<img src="${story.image}" class="story-img-full">` : ""}

      <div class="story-overlay-text">${story.content}</div>

      <div class="story-viewers">👁 ${story.views.length}</div>

    </div>
  `;

  document.body.appendChild(overlay);

  const progressContainer = overlay.querySelector(".story-progress");

  const bars = [];

  highlight.stories.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.className = "progress-bar-fill";

    const fill = document.createElement("div");

    if (i < sIndex) fill.style.width = "100%";
    else fill.style.width = "0%";

    bar.appendChild(fill);
    progressContainer.appendChild(bar);

    bars.push(fill);
  });

  function startProgress() {
    const current = bars[sIndex];

    current.style.transition = "none";
    current.style.width = "0%";

    setTimeout(() => {
      current.style.transition = "width 5s linear";
      current.style.width = "100%";
    }, 50);

    timer = setTimeout(next, 5000);
  }

  function stopTimer() {
    if (timer) clearTimeout(timer);
  }

  function close() {
    stopTimer();   // 🔥 IMPORTANT FIX
    overlay.remove();
    document.body.style.overflow = "auto";
    document.removeEventListener("keydown", keyHandler);
  }

  function next() {
    stopTimer();

    if (sIndex < highlight.stories.length - 1) {
      overlay.remove();
      openStory(hIndex, sIndex + 1, highlights, renderHighlights);
    } else {
      close(); // ❌ STOP AUTO NEXT HIGHLIGHT
    }
  }

  function prev() {
    stopTimer();

    if (sIndex > 0) {
      overlay.remove();
      openStory(hIndex, sIndex - 1, highlights, renderHighlights);
    }
  }

  // ---------- CLICK ----------
  overlay.onclick = (e) => {
    if (e.target.closest(".story-menu") || e.target.closest(".pause-btn")) return;

    const x = e.clientX;
    if (x < window.innerWidth / 2) prev();
    else next();
  };

  // ---------- KEYBOARD ----------
  function keyHandler(e) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next();
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") prev();
  }

  document.addEventListener("keydown", keyHandler);

  // ---------- CLOSE ----------
  overlay.querySelector(".story-close").onclick = (e) => {
    e.stopPropagation();
    close();
  };

  // ---------- MENU ----------
  const menuBtn = overlay.querySelector(".menu-btn");
  const dropdown = overlay.querySelector(".menu-dropdown");

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  };

  dropdown.querySelector(".cancel").onclick = () => {
    dropdown.classList.remove("active");
  };

  dropdown.querySelector(".delete").onclick = () => {
    highlights[hIndex].stories.splice(sIndex, 1);
    localStorage.setItem("highlights", JSON.stringify(highlights));
    close();
    renderHighlights();
  };

  // ---------- PAUSE ----------
  const pauseBtn = overlay.querySelector(".pause-btn");

  pauseBtn.onclick = () => {
    if (!isPaused) {
      isPaused = true;
      pauseBtn.textContent = "▶";
      stopTimer();
    } else {
      isPaused = false;
      pauseBtn.textContent = "⏸";
      startProgress();
    }
  };

  // ---------- VIEWERS LIST ----------
  overlay.querySelector(".story-viewers").onclick = () => {

    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-card">
        <h3>Viewers</h3>

        ${
          story.views.length
            ? story.views.map(v => `<p>${v}</p>`).join("")
            : "<p>No viewers</p>"
        }

        <button id="closeViewer">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeViewer").onclick = () => {
      modal.remove();
    };
  };

  startProgress();
}