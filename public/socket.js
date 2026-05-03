
export function initSocketHandlers({
    socket,
    chess,
    getBoard,
    roomId,
    updateScore,
    checkGameEnd,
    setPlayerRole
}) {

    // =======================
    // ROLE ASSIGNMENT
    // =======================
    socket.on("roleAssigned", (assignedRole) => {
        setPlayerRole(assignedRole);
    });

    // =======================
    // RECEIVE MOVE
    // =======================
    socket.on("move", (move) => {
        chess.move(move);
        board.position(chess.fen());

        updateScore();
        checkGameEnd();
    });

    // =======================
    // INITIAL SYNC
    // =======================
    socket.on("init", (fen) => {
        chess.load(fen);
        board.position(fen);
    });

    // =======================
    // ROOM UPDATE
    // =======================
    socket.on("roomUpdate", (data) => {

        const playersList = document.getElementById("playersList");
        const audienceList = document.getElementById("audienceList");

        if (playersList) {
            playersList.innerHTML = "";
            data.players.forEach(p => {
                const li = document.createElement("li");
                li.innerText = p.role === "white" ? "♔ WHITE" : "♚ BLACK";
                playersList.appendChild(li);
            });
        }

        if (audienceList) {
            audienceList.innerHTML = "";
            data.audience.forEach(() => {
                const li = document.createElement("li");
                li.innerText = "👀 Viewer";
                audienceList.appendChild(li);
            });
        }


        if (playersInfo) {
            playersInfo.innerHTML = "";
            data.players.forEach(p => {
                playersInfo.appendChild(createUserCard(p, true));
            });
        }

        if (audienceInfo) {
            audienceInfo.innerHTML = "";
            data.audience.forEach(a => {
                audienceInfo.appendChild(createUserCard(a, false));
            });
        }

    });
}