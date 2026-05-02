// =======================
// SOCKET CONNECTION
// =======================
const socket = io();

// =======================
// GET PARAMS
// =======================
const params = new URLSearchParams(window.location.search);
let role = params.get("role");
let roomId = params.get("roomId");

// 🔥 create room if not exists
if (!roomId) {
    roomId = Math.random().toString(36).substring(2, 8);
    window.location.href = `chess.html?role=${role}&roomId=${roomId}`;
}

// =======================
// JOIN ROOM
// =======================
socket.emit("joinRoom", {
    roomId: roomId,
    role: role
});

// =======================
// HANDLE ROLE ASSIGNMENT
// =======================
socket.on("roleAssigned", (assignedRole) => {
    console.log("Assigned role:", assignedRole);

    if (assignedRole === "audience") {
        role = "audience";
    } else {
        role = "player";
    }

    updateUI();
});

// =======================
// UI UPDATE
// =======================
const roleText = document.getElementById("roleText");

function updateUI() {
    if (roleText) {
        roleText.innerText =
            role === "audience"
                ? "Watching Game"
                : "Playing Game";
    }
}

// =======================
// CHESS INIT
// =======================
const chess = new Chess();

const board = Chessboard("board", {
    draggable: role === "player",
    position: "start",
    onDrop: onDrop
});

// =======================
// PLAYER MOVE
// =======================
function onDrop(source, target) {

    if (role !== "player") return "snapback";

    const move = chess.move({
        from: source,
        to: target,
        promotion: "q"
    });

    if (move === null) return "snapback";

    // 🔥 send move with roomId + fen
    socket.emit("move", {
        roomId: roomId,
        move: move,
        fen: chess.fen()
    });

    console.log("You played:", move);
}

// =======================
// RECEIVE MOVE FROM SERVER
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
const quitBtn = document.getElementById("quitBtn");

if (quitBtn) {
    quitBtn.onclick = () => {
        window.location.href = "home.html";
    };
}