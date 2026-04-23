// // badge click
// document.querySelectorAll(".badge").forEach(badge => {
//   badge.addEventListener("click", () => {
//     alert("Achievement unlocked!");
//   });
// });


document.addEventListener("DOMContentLoaded", () => {

  // badge click
  document.querySelectorAll(".badge").forEach(badge => {
    badge.addEventListener("click", () => {
      alert("Achievement unlocked!");
    });
  });

  const highlightContainer = document.querySelector(".highlights");

  if (!highlightContainer) {
    console.error("❌ .highlights container not found");
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
        <div class="circle">⭐</div>
        <p>${h.title}</p>
      `;

      div.addEventListener("click", () => {
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

      <input 
        type="text" 
        id="highlightTitle" 
        placeholder="Enter title"
      />

      <textarea 
        id="highlightContent"
        placeholder="Write something..."
      ></textarea>

      <div class="modal-actions">
        <button id="saveHighlight">Save</button>
        <button id="closeModal">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // close
  document.getElementById("closeModal").onclick = () => {
    overlay.remove();
  };

  // save
  document.getElementById("saveHighlight").onclick = () => {

    const title = document.getElementById("highlightTitle").value.trim();
    const content = document.getElementById("highlightContent").value.trim();

    if (!title) return;

    const newHighlight = {
      id: Date.now(),
      title,
      content
    };

    highlights.push(newHighlight);
    localStorage.setItem("highlights", JSON.stringify(highlights));

    overlay.remove();
    renderHighlights();
  };
}
  




  function openStory(h) {
    const overlay = document.createElement("div");

    overlay.className = "story-overlay";

    overlay.innerHTML = `
      <div class="story-box">
        <h2>${h.title}</h2>
        <p>${h.content}</p>
        <button id="closeStory">Close</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeStory").onclick = () => {
      overlay.remove();
    };
  }

  renderHighlights();

});