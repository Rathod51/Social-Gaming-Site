// =======================
// IMPORTS (MUST BE AT TOP)
// =======================

    import { initInfoPanel } from "./game-info.js";
    import { initChat } from "./game-chat.js";
    import { initPlayerJoin } from "./game-playerJoin.js";
    import { initSocketHandlers } from "./socket.js";

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
// USER COLOR
// =======================

    function getUserColor(username) {
        const colors = ["#FFD700", "#9B59B6", "#2ECC71", "#3498DB", "#E67E22", "#1ABC9C"];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }


// =======================
// START AFTER LOAD
// =======================

window.onload = function () {

    const roleText = document.getElementById("roleText");
   

    const chess = new Chess();
    let playerColor = null; // "white" or "black"

    let board = Chessboard("board", {
        draggable: false, // will enable after role assign
        position: "start",
        pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    });

    // =======================
    // JOIN ROOM
    // =======================

        socket.emit("joinRoom", { roomId, role });

        socket.on("setUsername", (name) => {
            socket.username = name;

        });

    // =======================
    // INIT MODULES
    // =======================

        initChat({ socket, roomId, getUserColor });
        initInfoPanel();
        initPlayerJoin(socket, roomId, role);
        initSocketHandlers({ socket, chess, getBoard: () => board,
            roomId, updateScore, checkGameEnd, setPlayerRole });

    // =======================
    // ROLE ASSIGNMENT
    // =======================

        socket.on("roleAssigned", (assignedRole) => {
        
            if (assignedRole === "white" || assignedRole === "black") {

                role = "player";
                playerColor = assignedRole;

            // RECREATE BOARD (important)
                Chessboard("board", null); // destroy old board

                board = Chessboard("board", {
                    draggable: true,
                    position: chess.fen(),
                    orientation: playerColor,
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
                    onDrop: onDrop,
                    onSnapEnd: onSnapEnd
                });

            } else {

                role = "audience";

                Chessboard("board", null);

                board = Chessboard("board", {
                    draggable: false,
                    position: chess.fen(),
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
                    onSnapEnd: onSnapEnd
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

            if (chess.isGameOver()) return "snapback";
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
        
        // INVALID MOVE SNAP BACK
            if (move === null) return "snapback";

            setTimeout(() => {
                    board.position(chess.fen());
            }, 0)

        // send move to server
            socket.emit("move", {
                roomId,
                move,
                fen: chess.fen()
            });

            updateScore();
            checkGameEnd();
           
        }

        function onSnapEnd() {
            board.position(chess.fen());
        }
        
    // =======================
    // SCORE
    // =======================

        function updateScore() {
            const whiteScore = document.getElementById("whiteScore");
            const blackScore = document.getElementById("blackScore");

            const pieces = chess.board().flat();

            let w = 0, b = 0;

            pieces.forEach(p => {
                if (!p) return;

                const val = { p:1, n:3, b:3, r:5, q:9, k:0 }[p.type];

                if (p.color === "w") w += val;
                else b += val;
            });

            whiteScore.innerText = w;
            blackScore.innerText = b;
        }

    // =======================
    // CHECKMATE LOGIC GAME END
    // =======================

        function checkGameEnd() {

            const resultModal = document.getElementById("resultModal");
            const resultText = document.getElementById("resultText");

            if (chess.isCheckmate()) {

                const winner = chess.turn() === "w" ? "Black" : "White";

                resultText.innerText = `${winner} wins by Checkmate!`;
                resultModal.classList.remove("hidden");

            } else if (chess.isDraw()) {

                resultText.innerText = "Game Draw!";
                resultModal.classList.remove("hidden");
            }
        }

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
    // INITIAL  STATE SYNC
    // =======================

        socket.on("init", (fen) => {
            chess.load(fen);
            board.position(fen);
        });

    // =======================
    // PLAYER JOIN MODAL SLOT OPEN 
    // =======================

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


    // =======================
    // QUIT BUTTON(MODAL)
    // =======================
        // quitBtn.onclick = () => {
        //     quitModal.style.display = "flex";
        // };
        // cancelQuitBtn.onclick = () => {
        //     quitModal.style.display = "none";
        // };
        // confirmQuitBtn.onclick = () => {
        //     window.location.href = "home.html";
        // };
    

    // =======================
    //  NEW GAME
    // =======================    

            const newGameBtn = document.getElementById("newGameBtn");

            if (newGameBtn) {
                newGameBtn.onclick = () => {
                    location.reload(); // reset game
                };
            }
};
