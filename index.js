const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let port = 8080;

// =======================
// USER STORAGE
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

    const existingUser = users.find(user => user.email === email);
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

    const user = users.find(user => user.email === email);
    if (!user) return res.send("User not found!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Incorrect password!");

    res.status(200).send("Login successful");
});


// =======================
// ROOM SYSTEM
// =======================
const rooms = {};

// structure:
// rooms = {
//   roomId: {
//     players: [{ id, role }],
//     audience: [{ id }],
//     gameState: null
//   }
// }


// =======================
// SOCKET.IO
// =======================
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

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

        let assignedRole = role;

        if (role === "player") {
            if (rooms[roomId].players.length < 2) {
                assignedRole = rooms[roomId].players.length === 0 ? "white" : "black";

                rooms[roomId].players.push({
                    id: socket.id,
                    role: assignedRole
                });

            } else {
                assignedRole = "audience";
                rooms[roomId].audience.push({ id: socket.id });
            }
        } else {
            rooms[roomId].audience.push({ id: socket.id });
        }

        // send assigned role back
        socket.emit("roleAssigned", assignedRole);

        console.log("Room:", roomId, rooms[roomId]);

        // send existing game state
        if (rooms[roomId].gameState) {
            socket.emit("init", rooms[roomId].gameState);
        }
    });


    // =======================
    // HANDLE MOVE
    // =======================
    socket.on("move", ({ roomId, move, fen }) => {

        if (!rooms[roomId]) return;

        rooms[roomId].gameState = fen;

        io.to(roomId).emit("move", move);
    });


    // =======================
    // DISCONNECT
    // =======================
    socket.on("disconnect", () => {

        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        rooms[roomId].players =
            rooms[roomId].players.filter(p => p.id !== socket.id);

        rooms[roomId].audience =
            rooms[roomId].audience.filter(a => a.id !== socket.id);

        // 🔥 delete empty room
        if (
            rooms[roomId].players.length === 0 &&
            rooms[roomId].audience.length === 0
        ) {
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