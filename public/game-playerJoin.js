// =======================
// PLAYER JOIN
// =======================



export function initPlayerJoin(socket, roomId, role) {

    const joinModal = document.getElementById("joinModal");
    const joinBtn = document.getElementById("joinBtn");
    const cancelJoin = document.getElementById("cancelJoin");
    const joinText = document.getElementById("joinText");
    const timerBar = document.getElementById("timerBar");

    socket.on("playerSlotOpen", ({ role: openRole, time }) => {

        if (role !== "audience") return;

        joinModal.classList.remove("hidden");
        joinText.innerText = `Join as ${openRole.toUpperCase()}?`;

        timerBar.style.width = "100%";

        setTimeout(() => {
            timerBar.style.width = "0%";
        }, 100);

        let timer = setTimeout(() => {
            joinModal.classList.add("hidden");
        }, time * 1000);

        joinBtn.onclick = () => {
            socket.emit("joinAsPlayer", { roomId, role: openRole });
            joinModal.classList.add("hidden");
            clearTimeout(timer);
        };

        cancelJoin.onclick = () => {
            joinModal.classList.add("hidden");
            clearTimeout(timer);
        };
    });
}
