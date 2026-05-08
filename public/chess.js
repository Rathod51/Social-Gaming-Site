 import { initInfoPanel} from "./game-info.js";
 import { initChat } from "./game-chat.js";
 import { initPlayerJoin } from "./game-playerJoin.js";
 import { initSocketHandlers } from "./socket.js";

// =======================
// SOCKET
// =======================

    const socket = io();

// =======================
// USER ID (FIX RECONNECT)
// =======================
    let userId = localStorage.getItem("userId");

    if (!userId) {
        userId = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("userId", userId);
    }

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
        window.chess = chess;

        let playerColor = null; // "white" or "black"
        let board = null;

        function createBoard(draggable, orientation = "white") {
                Chessboard("board", null);

            board = Chessboard("board", {
                draggable: false, // will enable after role assign
                position: "start",
                pieceTheme:  "lib/img/chesspieces/wikipedia/{piece}.png",
                onDrop: onDrop,
                onSnapEnd: onSnapEnd
            });

        }
        createBoard(false);

    // =======================
    // JOIN ROOM
    // =======================

        socket.emit("joinRoom", { roomId, role, userId});
    
        socket.on("setUsername", (name) => {
            socket.username = name;
        });

    // =======================
    // INIT MODULES
    // =======================

        initChat({ socket, roomId, getUserColor });
        initInfoPanel();
        initPlayerJoin(socket, roomId, role);


    // =======================
    // ROLE ASSIGNMENT
    // =======================

        function setPlayerRole(assignedRole) {


            if (assignedRole === "white" || assignedRole === "black") {

                window.role = "player";
                playerColor = assignedRole;

                board = Chessboard("board", {
                    draggable: true,
                    position: chess.fen(),
                    orientation: playerColor,
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
                    onDrop: onDrop,
                    onSnapEnd: onSnapEnd
                });

            } else {

                window.role = "audience";

                board = Chessboard("board", {
                    draggable: false,
                    position: chess.fen(),
                    pieceTheme: "lib/img/chesspieces/wikipedia/{piece}.png",
                    onDrop: onDrop,
                    onSnapEnd: onSnapEnd
                });
            }
                    
            if (roleText) {
                roleText.innerText =
                    playerColor === "white" ? "You are WHITE" :
                    playerColor === "black" ? "You are BLACK" :
                    "Watching Game";
            }
        }


        initSocketHandlers({ socket, chess, getBoard: () => board,
            roomId, updateScore, checkGameEnd, setPlayerRole });
            
    // =======================
    // MOVE LOGIC
    // ========================

        function onDrop(source, target) {

            
            if (role !== "player") return "snapback";
            if (!playerColor) return "snapback";
            if (chess.game_over()) return "snapback";
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
            if (!move) return "snapback";
             board.position(chess.fen());

            // setTimeout(() => {
            //         board.position(chess.fen());
            // }, 0)

        // send move to server
            socket.emit("move", {
                roomId,
                move,
                fen: chess.fen()
            });

            // const currentTurn = chess.turn();
            // socket.emit("updateTurn", { roomId, turn: currentTurn });

            updateMoveHistory();
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

            chess.board().flat().forEach(p => {
                if (!p) return;

                const val = { p:1, n:3, b:3, r:5, q:9, k:0 }[p.type];

                if (p.color === "w") w += val;
                else b += val;
            });

            if (whiteScore) whiteScore.innerText = w;
            if (blackScore) blackScore.innerText = b;
        }

    // =======================
    // CHECKMATE LOGIC GAME END
    // =======================

        function checkGameEnd() {

            const resultModal = document.getElementById("resultModal");
            const resultText = document.getElementById("resultText");

            if (chess.in_checkmate()) {
                const winner = chess.turn() === "w" ? "Black" : "White";

                resultText.innerText = `${winner} wins by Checkmate!`;
                resultModal.classList.remove("hidden");
                return;
            } 
            
        // draw

            if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition() || chess.insufficient_material()) {

               resultText.innerText = "Game Draw";
                resultModal.classList.remove("hidden");
            }
        }
    
    // =======================
    //  MOVE HISTORY
    // ========================

        window.updateMoveHistory = function() {

            const history = chess.history(); // ["e4", "e5", "Nf3", ...]
            const container = document.getElementById("moveHistory");

            if (!container) return;

            container.innerHTML = "";

            for (let i = 0; i < history.length; i += 2) {

                const moveNumber = Math.floor(i / 2) + 1;
                const whiteMove = history[i] || "";
                const blackMove = history[i + 1] || "";
                const row = document.createElement("div");
                row.className = "moveRow";

                row.innerHTML = `
                    <span class="moveNumber">${moveNumber}.</span>
                    <span class="moveWhite">${whiteMove}</span>
                    <span class="moveBlack">${blackMove}</span>
                `;

                container.appendChild(row);
            }

            container.scrollTop = container.scrollHeight;
        }

         // =======================
        // HISTORY TOGGLE
        // =======================


        const historyBtn = document.getElementById("historyToggleBtn");
        const historyBox = document.getElementById("historyBox");

        if (historyBtn && historyBox) {
            historyBtn.onclick = () => {
                historyBox.classList.toggle("hidden");
            };
        }




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
