import { initChat } from "./game-chat.js";
import { initControls } from "./game-controls.js";
import { initInfoPanel } from "./game-info.js";
import { initSocketHandlers } from "./socket.js";
import { initGameEnd } from "./gameEnd.js";

const socket = io();

const chess = new Chess();

let board = null;

let playerRole = "white";

// =======================
// USERNAME
// =======================

const username = localStorage.getItem("username") ||
    "Player_" + Math.floor(Math.random() * 1000);

window.username = username;

// =======================
// ROOM ID
// =======================

const roomId =

    new URLSearchParams(window.location.search).get("roomId")|| "global-room";
        
// =======================
// DRAG START
// =======================

function onDragStart(source, piece) {

    // WRONG PLAYER COLOR

    if ( (piece.startsWith("w")&& playerRole !== "white") ||
            (piece.startsWith("b")&&playerRole !== "black")) {

        return false;
    }

    // ONLY ACTIVE MOVER CAN MOVE

        if (

            playerRole === "white"

            &&

            (
                !window.activeWhiteMover ||

                window.activeWhiteMover.id !==
                socket.id
            )

        ) {

            return false;
        }

        if (

            playerRole === "black"

            &&

            (
                !window.activeBlackMover ||

                window.activeBlackMover.id !==
                socket.id
            )

        ) {

            return false;
        }


    // WRONG TURN

    if ( (chess.turn() === "w" && piece.startsWith("b")) ||
            (chess.turn() === "b" && piece.startsWith("w"))) {

        return false;
    }
}

// =======================
// DROP
// =======================

function onDrop(source, target) {

    // SAME SQUARE

    if (source === target) {

        return "snapback";
    }

    let move = null;

    try {

        // TRY MOVE LOCALLY

        move = chess.move({

            from: source,
            to: target,
            promotion: "q"
        });

    } catch (err) {

        return "snapback";
    }

    // INVALID MOVE

    if (!move) {

        return "snapback";
    }

    // UNDO
    // SERVER IS SOURCE OF TRUTH

    chess.undo();

    // SEND MOVE TO SERVER

    socket.emit("move", {

        roomId,

        source,

        target
    });
}

// =======================
// CREATE BOARD
// =======================

board = Chessboard("board", {

    draggable: true,
    position: "start",
    orientation: playerRole,
    pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop
});

// =======================
// MOVE HISTORY
// =======================

window.updateMoveHistory = function(history = []) {

    const moveHistory =
        document.getElementById(
            "moveHistory"
        );

    if (!moveHistory) return;

    moveHistory.innerHTML = "";

    for (

        let i = 0;

        i < history.length;

        i += 2

    ) {

        const row =
            document.createElement("div");

        row.className = "moveRow";

        row.innerHTML = `

            <span class="moveNumber">
                ${Math.floor(i / 2) + 1}.
            </span>

            <span class="moveWhite">
                ${history[i] || ""}
            </span>

            <span class="moveBlack">
                ${history[i + 1] || ""}
            </span>
        `;

        moveHistory.appendChild(row);
    }

    moveHistory.scrollTop =
        moveHistory.scrollHeight;
};

// =======================
// JOIN ROOM
// =======================

socket.emit("joinRoom", {

    roomId,

    username
});

// =======================
// WINDOW LOAD
// =======================

window.onload = () => {

    // CHAT

    initChat({
        socket,
        roomId,
        role: playerRole
    });

    // CONTROLS

    initControls();

        const claimMoveBtn = document.getElementById("claimMoveBtn");

        if (claimMoveBtn) {

            claimMoveBtn.addEventListener("click",() => {
                    socket.emit(
                        "claimMove",
                        { roomId }
                    );
            });
        }


    // INFO PANEL

    initInfoPanel();

    // GAME END

    window.gameEndHandler =
        initGameEnd({

            chess,

            socket,

            roomId,

            getBoard: () => board
        });

    // SOCKET HANDLERS

    initSocketHandlers({

        socket,

        chess,

        getBoard: () => board,

        checkGameEnd:
            window.gameEndHandler
            .checkGameEnd,

        setPlayerRole: (role) => {

            playerRole = role;

            if (board) {

                board.orientation(role);
            }
        }
    });
};





