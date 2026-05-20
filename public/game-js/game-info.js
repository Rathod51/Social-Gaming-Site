export function initInfoPanel() {

    const infoBtn = document.getElementById("infoBtn");

    const infoPanel = document.getElementById("infoPanel");

    // TOGGLE PANEL

    if (infoBtn && infoPanel) {

        infoBtn.addEventListener("click", () => {

            infoPanel.classList.toggle("open");

        });
    }

    // CLOSE OUTSIDE CLICK

    document.addEventListener("click", (e) => {

        if (!infoPanel || !infoBtn) return;

        const clickedInside =
            infoPanel.contains(e.target);

        const clickedButton =
            infoBtn.contains(e.target);

        if (
            infoPanel.classList.contains("open")
            &&
            !clickedInside
            &&
            !clickedButton
        ) {

            infoPanel.classList.remove("open");
        }
    });
}

// PLAYER CARD

window.createUserCard = function(user) {

    const div = document.createElement("div");

    div.className = "userCard";

    const onlineClass =
        user.disconnected
            ? "offline"
            : "online";

    const roleDot =
        user.role === "white"
            ? "⚪"
            : "⚫";

    div.innerHTML = `
        <div class="userHeader">

            <span class="onlineDot ${onlineClass}"></span>

            <span>${roleDot}</span>

            <span class="userName">
                ${user.username}
            </span>

        </div>
    `;

    return div;
};