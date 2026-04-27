
document.addEventListener("DOMContentLoaded", () => {

  // badge click
  document.querySelectorAll(".badge").forEach(badge => {
    badge.addEventListener("click", () => {
      alert("Achievement unlocked!");
    });
  });

  const highlightContainer = document.querySelector(".highlights");

  if (!highlightContainer) {
    console.error("highlights container not found");
    return;
  }

  let highlights = JSON.parse(localStorage.getItem("highlights")) || [];

  function renderHighlights() {

    highlightContainer.innerHTML = `
      <div class="highlight-item add-highlight" id="addHighlight">
        <div class="circle">+</div>
        <p>Add</p>
      </div>
    `;

    highlights.forEach(h => {
      const div = document.createElement("div");
      div.className = "highlight-item";

      div.innerHTML = `
        <div class="circle">
        
          ${h.image ? `<img src="${h.image}" class="highlight-img">`: ``}
        </div>
        <p>${h.title}</p>
      `;

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        openStory(h);
      });

      highlightContainer.appendChild(div);
    });

    document.getElementById("addHighlight").onclick = openCreateModal;
  }

 function openCreateModal() {

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal-card">
      <h3>Create Highlight</h3>

      <input type="text" id="highlightTitle" placeholder="Enter title"/>
      <textarea id="highlightContent" placeholder="Write something..."></textarea>
      <input type="file" id="highlightImage" accept="image/*"/>

      <img id="previewImg" style="width:100%; display:none; border-radius:8px; margin-top:10px;"/>
      <div class="modal-actions">
        <button id="saveHighlight">Save</button>
        <button id="closeModal">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // CLOSE
  document.getElementById("closeModal").onclick = () => {
    overlay.remove();
  };


  // IMAGE PREVIEW
  const fileInput = document.getElementById("highlightImage");
  const preview = document.getElementById("previewImg");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function () {
        preview.src = reader.result;
        preview.style.display = "block";
      };

      reader.readAsDataURL(file);
    }
  });


  // SAVE

  document.getElementById("saveHighlight").onclick = () => {

    const title = document.getElementById("highlightTitle").value.trim();
    const content = document.getElementById("highlightContent").value.trim();
    const file = document.getElementById("highlightImage").files[0];

    if (!title) return;

    // if image exists
    if (file) {

      const reader = new FileReader();

      reader.onload = function () {

        const newHighlight = {
          id: Date.now(),
          title,
          content,
          image: reader.result   //base64 image
        };

        highlights.push(newHighlight);
        localStorage.setItem("highlights", JSON.stringify(highlights));

        overlay.remove();
        renderHighlights();
      };

      reader.readAsDataURL(file);

    } else {

      const newHighlight = {
        id: Date.now(),
        title,
        content,
        image: ""
      };

      highlights.push(newHighlight);
      localStorage.setItem("highlights", JSON.stringify(highlights));

      overlay.remove();
      renderHighlights();
    }
  };
}


  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function openStory(index) {

  const overlay = document.createElement("div");
  document.body.style.overflow = "hidden";
  overlay.className = "story-overlay";

    overlay.innerHTML = `
    <div class="story-view">

    <!-- PROGRESS BAR -->
    <div class="story-progress">
      <div class="progress-bar-fill"></div>
    </div>

    <!-- HEADER -->
    <div class="story-header">
      <img src="https://i.pravatar.cc/40" class="story-avatar">
      
      <div class="story-user">
        <span class="story-username">the_twinkel_rathod</span>
        <span class="story-time">${formatTime(h.id)}</span>
      </div>

      <div class="story-controls">

        <button class="pause-btn">⏸</button>

        <button class="menu-btn">⋯</button>
        <div class="menu-dropdown">
          <div class="menu-item delete">Delete</div>
          <div class="menu-item cancel">Cancel</div>
        </div>
      </div>

    </div>

    <!-- IMAGE -->
    ${h.image ? `<img src="${h.image}" class="story-img-full">` : ""}

    <!-- TEXT OVERLAY -->
    <div class="story-overlay-text">
      ${h.content}
    </div>

  </div>
`;

  document.body.appendChild(overlay);

    let isPaused = false;
    let timer;

    const progress = document.querySelector(".progress-bar-fill");
    const pauseBtn = document.querySelector(".pause-btn");

// start progress
    setTimeout(() => {
      progress.style.width = "100%";
    }, 50);

// auto close
    timer = setTimeout(closeStory, 5000);

    function closeStory() {
      overlay.remove();
      document.body.style.overflow = "auto";
    }

// pause / resume
  pauseBtn.onclick = () => {

    if (!isPaused) {
      isPaused = true;
      pauseBtn.textContent = "▶";

      progress.style.transition = "none";
      clearTimeout(timer);

    } else {
      isPaused = false;
      pauseBtn.textContent = "⏸";

      progress.style.transition = "width 5s linear";
      progress.style.width = "100%";

      timer = setTimeout(closeStory, 3000);
    }
  };


    const menuBtn = document.querySelector(".menu-btn");
    const dropdown = document.querySelector(".menu-dropdown");

// toggle menu
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    };

// cancel
    dropdown.querySelector(".cancel").onclick = () => {
      dropdown.classList.remove("active");
    };

// delete
    dropdown.querySelector(".delete").onclick = () => {

  // remove highlight
      highlights = highlights.filter(item => item.id !== h.id);

    localStorage.setItem("highlights", JSON.stringify(highlights));

    overlay.remove();
    document.body.style.overflow = "auto";

  renderHighlights();
};


  // close on click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    } 
  });
}

  renderHighlights();

});
