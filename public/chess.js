// =======================
// SOCKET
// =======================


    const socket = io();

// =======================
// GET PARAMS
// =======================


    const params = new URLSearchParams(window.location.search);
    let role = params.get("role") || "audience";
    let roomId = params.get("roomId");

// =======================
// SAFE ROOM CREATION
// =======================


    if (!roomId) {
        const newRoom = Math.random().toString(36).substring(2, 8);
        window.location.href = `chess.html?role=${role}&roomId=${newRoom}`;
    }

// =======================
// START AFTER LOAD
// =======================

window.onload = function () {

    const roleText = document.getElementById("roleText");
    const quitBtn = document.getElementById("quitBtn");

    const chess = new Chess();

    let playerColor = null; // "white" or "black"

    let board = Chessboard("board", {
        draggable: false, // will enable after role assign
        position: "start",
        pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
        onDrop: onDrop
    });

    // =======================
    // JOIN ROOM
    // =======================

        socket.emit("joinRoom", { roomId, role });

    // =======================
    // ROLE ASSIGNMENT
    // =======================


        socket.on("roleAssigned", (assignedRole) => {
        console.log("Assigned:", assignedRole);

            if (assignedRole === "white" || assignedRole === "black") {

                role = "player";
                playerColor = assignedRole;

                // 🔥 RECREATE BOARD (important)
                Chessboard("board", null); // destroy old board

                board = Chessboard("board", {
                    draggable: true,
                    position: chess.fen(),
                    orientation: playerColor,
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
                    onDrop: onDrop
                });

            } else {

                role = "audience";

                Chessboard("board", null);

                board = Chessboard("board", {
                    draggable: false,
                    position: chess.fen(),
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png"
                });
            }

    // UI update

        if (roleText) {
            roleText.innerText =
                playerColor === "white" ? "You are WHITE" :
                playerColor === "black" ? "You are BLACK" :
                "Watching Game";
        }
    });

    // =======================
    // MOVE LOGIC
    // =======================


        function onDrop(source, target) {

            if (role !== "player") return "snapback";

            // check turn
            const turn = chess.turn(); // "w" or "b"

            if (
                (playerColor === "white" && turn !== "w") ||
                (playerColor === "black" && turn !== "b")
            ) {
                return "snapback";
            }

            const move = chess.move({
                from: source,
                to: target,
                promotion: "q"
            });

            if (move === null) return "snapback";

            // send move to server
            socket.emit("move", {
                roomId,
                move,
                fen: chess.fen()
            });
        }

    // =======================
    // RECEIVE MOVE
    // =======================


        socket.on("move", (move) => {
            chess.move(move);
            board.position(chess.fen());
        });

    // =======================
    // INITIAL SYNC
    // =======================


        socket.on("init", (fen) => {
            chess.load(fen);
            board.position(fen);
        });

    // =======================
    // QUIT BUTTON
    // =======================


        if (quitBtn) {
            quitBtn.onclick = () => {
                window.location.href = "home.html";
            };
        }

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
        });

};

