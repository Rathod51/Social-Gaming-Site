const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let port = 8080;

// =======================
// USER STORAGE (TEMP)
// =======================
const users = [];

// =======================
// MIDDLEWARE
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =======================
// SIGNUP
// =======================
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.send("User already exists!");

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ username, email, password: hashedPassword });

    res.redirect("/home.html");
});

// =======================
// LOGIN
// =======================

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.send("User not found!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Incorrect password!");

    res.status(200).send("Login successful");
});




// =======================
// ROOM STORAGE
// =======================
const rooms = {};
/*
rooms = {
  roomId: {
    players: [{ id, role }], // role: white/black
    audience: [{ id }],
    gameState: fen
  }
}
*/

// =======================
// SOCKET.IO
// =======================


io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // assign temporary username
    socket.username = "User_" + socket.id.slice(0, 4);

// =======================
// JOIN ROOM
// =======================


    socket.on("joinRoom", ({ roomId, role }) => {

        socket.join(roomId);
        socket.roomId = roomId;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                audience: [],
                gameState: null
            };
        }

        const room = rooms[roomId];

//remove duplicate entries

        room.players = room.players.filter(p => p.id !== socket.id);
        room.audience = room.audience.filter(a => a.id !== socket.id);

        let assignedRole = role;

        if (role === "player") {

            if (room.players.length < 2) {
                assignedRole = room.players.length === 0 ? "white" : "black";

                room.players.push({
                    id: socket.id,
                    role: assignedRole,
                    username: socket.username

                });
            } else {
                assignedRole = "audience";

                room.audience.push({ 
                    id: socket.id,
                    username: socket.username
                 });
            }
        } else {
            assignedRole = "audience";
            room.audience.push({ 
                id: socket.id,
                username: socket.username
             });
        }

    // send assigned role back

        socket.emit("roleAssigned", assignedRole);

     // send room update

        io.to(roomId).emit("roomUpdate", {
            players: room.players,
            audience: room.audience
        });

        console.log("Room:", roomId, room);

    // send current board state

        if (room.gameState) {
            socket.emit("init", room.gameState);
        }
    });

// =======================
// HANDLE MOVE
// =======================


    socket.on("move", ({ roomId, move, fen }) => {

        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return; // audience can't move

    // check turn
        const turn = fen.split(" ")[1]; // 'w' or 'b'

        const validTurn =
            (player.role === "white" && turn === "b") ||
            (player.role === "black" && turn === "w");

        if (!validTurn) {
            console.log("Invalid turn attempt:", socket.id);
            return;
        }

    // save game state
        room.gameState = fen;

    // broadcast move
        io.to(roomId).emit("move", move);
    });

// =======================
// DISCONNECT
// =======================


    socket.on("disconnect", () => {

        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];

        room.players = room.players.filter(p => p.id !== socket.id);
        room.audience = room.audience.filter(a => a.id !== socket.id);

 // send update BEFORE deletion

        io.to(roomId).emit("roomUpdate", {
            players: room.players,
            audience: room.audience
        });


    // delete empty room

        if (room.players.length === 0 && room.audience.length === 0) {
            delete rooms[roomId];
            console.log("Deleted empty room:", roomId);
        }
    });
});






// =======================
// START SERVER
// =======================


http.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});