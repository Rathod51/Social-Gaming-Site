document.addEventListener("DOMContentLoaded", () => {

  const highlightContainer = document.querySelector(".highlights");

  let highlights = JSON.parse(localStorage.getItem("highlights")) || [];

  function renderHighlights() {

    highlightContainer.innerHTML = `
      <div class="highlight-item add-highlight" id="addHighlight">
        <div class="circle">+</div>
        <p>Add</p>
      </div>
    `;

    highlights.forEach((h, index) => {
      const div = document.createElement("div");
      div.className = "highlight-item";

      // show first story image as thumbnail
      const thumb = h.stories?.[0]?.image || "";

      div.innerHTML = `
        <div class="circle">
          ${thumb ? `<img src="${thumb}" class="highlight-img">` : ""}
        </div>
        <p>${h.title}</p>
      `;

      div.onclick = () => {
        openStory(index, 0, highlights, renderHighlights);
      };

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
});