
export function initSocketHandlers({
    socket, chess, getBoard, roomId, updateScore, checkGameEnd, setPlayerRole}) {

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
        getBoard().position(chess.fen());

        updateScore();
        checkGameEnd();
        if (window.updateMoveHistory) {
            window.updateMoveHistory();
        }

        socket.emit("forceRoomUpdate", { roomId });
    });

    // =======================
    // INITIAL SYNC
    // =======================

    socket.on("init", (data) => {
       
        console.log("INIT:", data);
        // RESET FIRST

        if (!data) return;
        chess.reset();

        //REBUILD FROM MOVES (MOST IMPORTANT)

        if (data.moves && data.moves.length > 0) {
            data.moves.forEach(m => chess.move(m));

        } else if (data.fen) {
            chess.load(data.fen);
        }
        // UPDATE BOARD
        const board = getBoard();

        if (board) {
            board.position(chess.fen());
        }

        // UPDATE UI
        updateScore();
        checkGameEnd();
        
        if (window.updateMoveHistory) {
            window.updateMoveHistory();
        }
        
    });

    

    // =======================
    // ROOM UPDATE
    // =======================
    socket.on("roomUpdate", (data) => {

        const playersList = document.getElementById("playersInfo");
        const audienceList = document.getElementById("audienceInfo");

        const currentTurn = chess.turn();

        if (playersList) {
            playersList.innerHTML = "";
            data.players.forEach(p => {
                playersList.appendChild(createUserCard(p, true, currentTurn));
            });
        }

        if (audienceList) {
            audienceList.innerHTML = "";
            data.audience.forEach(a => {
                audienceList.appendChild(createUserCard(a, false, currentTurn));
            });
        }

    });
}