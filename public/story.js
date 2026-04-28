const theme = localStorage.getItem("theme");

if (theme === "light") {
  document.body.classList.add("light-mode");
}

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

  overlay.innerHTML = `
    <div class="story-view">

      <div class="story-progress"></div>

      <div class="story-header">
        <span>${highlight.title}</span>
      </div>

      ${story.image ? `<img src="${story.image}" class="story-img-full">` : ""}

      <div class="story-overlay-text">${story.content}</div>

    </div>
  `;

  document.body.appendChild(overlay);

  // ---------- PROGRESS BARS ----------
  const progressContainer = overlay.querySelector(".story-progress");

  highlight.stories.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.className = "progress-bar-fill";
    bar.style.width = i < sIndex ? "100%" : "0%";
    progressContainer.appendChild(bar);
  });

  const bars = progressContainer.children;
  let timer;

  function play() {
    const current = bars[sIndex];
    current.style.transition = "width 5s linear";
    current.style.width = "100%";

    timer = setTimeout(next, 5000);
  }

  function next() {

    // next story in same highlight
    if (sIndex < highlight.stories.length - 1) {
      overlay.remove();
      openStory(hIndex, sIndex + 1, highlights, renderHighlights);
      return;
    }

    // next highlight
    if (hIndex < highlights.length - 1) {
      overlay.remove();
      openStory(hIndex + 1, 0, highlights, renderHighlights);
      return;
    }

    close();
  }

  function prev() {

    if (sIndex > 0) {
      overlay.remove();
      openStory(hIndex, sIndex - 1, highlights, renderHighlights);
      return;
    }

    if (hIndex > 0) {
      const prevH = highlights[hIndex - 1];
      overlay.remove();
      openStory(hIndex - 1, prevH.stories.length - 1, highlights, renderHighlights);
    }
  }

  function close() {
    overlay.remove();
    document.body.style.overflow = "auto";
  }

  // ---------- CLICK NAV ----------
  overlay.onclick = (e) => {

    const x = e.clientX;

    if (x < window.innerWidth / 2) {
      prev();
    } else {
      next();
    }
  };

  // ---------- SWIPE ----------
  let startX = 0;

  overlay.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  overlay.addEventListener("touchend", e => {
    const diff = startX - e.changedTouches[0].clientX;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) next();
    else prev();
  });

  play();
}