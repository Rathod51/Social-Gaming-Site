export function initInfoPanel() {

        const infoBtn = document.getElementById("infoBtn");
        const infoPanel = document.getElementById("infoPanel");
        const quitBtn = document.getElementById("quitBtn");
        const quitModal = document.getElementById("quitModal");
        const cancelQuitBtn = document.getElementById("cancelQuit");
        const confirmQuitBtn = document.getElementById("confirmQuit");


// =======================
// INFO PANEL TOGGLE
// =======================    

        if (infoBtn && infoPanel) {
            infoBtn.onclick = () => {
                infoPanel.classList.toggle("open");
            };
        }

        document.addEventListener("click", (e) => {
            if (!infoPanel) return;

            if (infoPanel.classList.contains("open")) {
                if (!infoPanel.contains(e.target) && !infoBtn.contains(e.target)) {
                    infoPanel.classList.remove("open");
                }
            }
        });


// =======================
// QUIT BUTTON(MODAL)
// =======================

        if (quitBtn && quitModal) {
            quitBtn.onclick = () => {
                quitModal.style.display = "flex";
            };
        }

        if (cancelQuitBtn && quitModal) {
            cancelQuitBtn.onclick = () => {
                quitModal.style.display = "none";
            };
        }

        if (confirmQuitBtn) {
            confirmQuitBtn.onclick = () => {
                window.location.href = "home.html";
            };
        }
}


// =======================
// USER CARD UI
// =======================


    window.createUserCard = function(user, isPlayer, currentTurn) {

    const div = document.createElement("div");
     div.className = "userCard";

// role dot

    let roleDot = "";
    
        if (user.role === "white") {
            roleDot = `<span class="dot white"></span>`;
        } else if (user.role === "black") {
            roleDot = `<span class="dot black"></span>`;
        }

//player status

    if (
        (user.role === "white" && currentTurn === "w") ||
        (user.role === "black" && currentTurn === "b")
    ) {
        div.classList.add("active");
    }  

    div.innerHTML = `
        <img src="https://i.pravatar.cc/40"/>
        <div class="userInfo">
            <div class="userName">
                ${roleDot} ${user.username}
            </div>
            <small>@${user.username}</small>
        </div>
    `;

    div.onclick = () => {
        window.location.href = `profile.html?user=${user.id}`;
    };

    return div;
}