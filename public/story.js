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

  let timer;
  let isPaused = false;

  overlay.innerHTML = `
    <button class="story-close">✕</button>

    <div class="story-view">

      <!-- PROGRESS -->
      <div class="story-progress"></div>

      <!-- HEADER -->
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

    </div>
  `;

  document.body.appendChild(overlay);

  const view = overlay.querySelector(".story-view");

  // ---------- PROGRESS ----------
  const progressContainer = overlay.querySelector(".story-progress");

  highlight.stories.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.className = "progress-bar-fill";

    const fill = document.createElement("div");
    fill.style.width = i < sIndex ? "100%" : "0%";      

    bar.appendChild(fill);
    progressContainer.appendChild(bar);
  });

  const bars = progressContainer.children;

  function play() {
    const current = bars[sIndex].firstChild;

      current.style.transition = "width 5s linear";
      current.style.width = "100%";
      timer = setTimeout(next, 5000);
    }

    function pause() {
      clearTimeout(timer);
    }

    function close() {
      overlay.remove();
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", keyHandler);
    }

  function next() {
    if (sIndex < highlight.stories.length - 1) {
      overlay.remove();
      openStory(hIndex, sIndex + 1, highlights, renderHighlights);
    } else if (hIndex < highlights.length - 1) {
      overlay.remove();
      openStory(hIndex + 1, 0, highlights, renderHighlights);
    } else {
      close();
    }
  }

  function prev() {
    if (sIndex > 0) {
      overlay.remove();
      openStory(hIndex, sIndex - 1, highlights, renderHighlights);
    } else if (hIndex > 0) {
      const prevH = highlights[hIndex - 1];
      overlay.remove();
      openStory(hIndex - 1, prevH.stories.length - 1, highlights, renderHighlights);
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
      pause();
    } else {
      isPaused = false;
      pauseBtn.textContent = "⏸";
      play();
    }
  };

  play();
}