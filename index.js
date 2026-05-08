
const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = 8080;

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
// AUTH
// =======================

app.post("/signup", async (req, res) => {

    const { username, email, password } = req.body;

    const existingUser =
        users.find(u => u.email === email);

    if (existingUser) {
        return res.send("User already exists!");
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    users.push({
        username,
        email,
        password: hashedPassword
    });

    res.redirect("/home.html");
});

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user =
        users.find(u => u.email === email);

    if (!user) {
        return res.send("User not found!");
    }

    const match =
        await bcrypt.compare(password, user.password);

    if (!match) {
        return res.send("Incorrect password!");
    }

    res.status(200).send("Login successful");
});

// =======================
// ROOM STORAGE
// =======================

const rooms = {};

// =======================
// SOCKET CONNECTION
// =======================

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    socket.username =
        "User_" + socket.id.slice(0, 4);

    // =======================
    // JOIN ROOM
    // =======================

    socket.on("joinRoom", ({
        roomId,
        role,
        userId
    }) => {

        socket.join(roomId);

        socket.roomId = roomId;
        socket.userId = userId;

        // CREATE ROOM
        if (!rooms[roomId]) {

            rooms[roomId] = {
                players: [],
                audience: [],
                gameState: {
                    fen: null,
                    moves: []
                }
            };
        }

        const room = rooms[roomId];

        // =======================
        // EXISTING USER?
        // =======================

        let existingPlayer =
            room.players.find(
                p => p.userId === userId
            );

        let existingAudience =
            room.audience.find(
                a => a.userId === userId
            );

        let assignedRole = "audience";

        // =======================
        // RECONNECT PLAYER
        // =======================

        if (existingPlayer) {

            existingPlayer.id = socket.id;
            existingPlayer.disconnected = false;

            assignedRole = existingPlayer.role;
        }

        // =======================
        // RECONNECT AUDIENCE
        // =======================

        else if (existingAudience) {

            existingAudience.id = socket.id;
            existingAudience.disconnected = false;

            assignedRole = "audience";
        }

        // =======================
        // NEW USER
        // =======================

        else {

            const whitePlayer =
                room.players.find(
                    p => p.role === "white"
                );

            const blackPlayer =
                room.players.find(
                    p => p.role === "black"
                );

            // PLAYER REQUEST
            if (role === "player") {

                // FIRST PLAYER = WHITE
                if (!whitePlayer) {

                    assignedRole = "white";

                    room.players.push({
                        id: socket.id,
                        userId,
                        role: "white",
                        username: socket.username,
                        disconnected: false
                    });
                }

                // SECOND PLAYER = BLACK
                else if (!blackPlayer) {

                    assignedRole = "black";

                    room.players.push({
                        id: socket.id,
                        userId,
                        role: "black",
                        username: socket.username,
                        disconnected: false
                    });
                }

                // OTHERWISE AUDIENCE
                else {

                    assignedRole = "audience";

                    room.audience.push({
                        id: socket.id,
                        userId,
                        username: socket.username,
                        disconnected: false
                    });
                }
            }

            // AUDIENCE REQUEST
            else {

                assignedRole = "audience";

                room.audience.push({
                    id: socket.id,
                    userId,
                    username: socket.username,
                    disconnected: false
                });
            }
        }

        // =======================
        // SEND ROLE
        // =======================

        socket.emit("roleAssigned", assignedRole);

        socket.emit("setUsername", socket.username);

        // =======================
        // SEND GAME STATE
        // =======================

        socket.emit("init", {
            fen: room.gameState.fen,
            moves: room.gameState.moves
        });

        // =======================
        // UPDATE ROOM
        // =======================

        io.to(roomId).emit("roomUpdate", {
            players: room.players,
            audience: room.audience
        });

        console.log("ROOM:", roomId);
    });

    // =======================
    // HANDLE MOVE
    // =======================

    socket.on("move", ({
        roomId,
        move,
        fen
    }) => {

        const room = rooms[roomId];

        if (!room) return;

        room.gameState.fen = fen;

        room.gameState.moves.push(move);

        io.to(roomId).emit("move", move);

        io.to(roomId).emit("roomUpdate", {
            players: room.players,
            audience: room.audience
        });
    });

    // =======================
    // JOIN AS PLAYER
    // =======================

    socket.on("joinAsPlayer", ({
        roomId,
        role
    }) => {

        const room = rooms[roomId];

        if (!room) return;

        // SLOT TAKEN?
        const taken =
            room.players.find(
                p => p.role === role
            );

        if (taken) return;

        // REMOVE AUDIENCE
        room.audience =
            room.audience.filter(
                a => a.userId !== socket.userId
            );

        // ADD PLAYER
        room.players.push({
            id: socket.id,
            userId: socket.userId,
            role,
            username: socket.username,
            disconnected: false
        });

        socket.emit("roleAssigned", role);

        io.to(roomId).emit("roomUpdate", {
            players: room.players,
            audience: room.audience
        });
    });

    // =======================
    // CHAT
    // =======================

    socket.on("chatMessage", ({
        roomId,
        message
    }) => {

        const room = rooms[roomId];

        if (!room) return;

        let role = "audience";

        const player =
            room.players.find(
                p => p.userId === socket.userId
            );

        if (player) {
            role = player.role;
        }

        io.to(roomId).emit("chatMessage", {
            username: socket.username,
            role,
            message
        });
    });

    // =======================
    // DISCONNECT
    // =======================

    socket.on("disconnect", () => {

        const roomId = socket.roomId;

        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];

        const leavingPlayer =
            room.players.find(
                p => p.userId === socket.userId
            );

        const leavingAudience =
            room.audience.find(
                a => a.userId === socket.userId
            );

        // MARK DISCONNECTED
        if (leavingPlayer) {
            leavingPlayer.disconnected = true;
        }

        if (leavingAudience) {
            leavingAudience.disconnected = true;
        }

        // WAIT FOR RECONNECT
        setTimeout(() => {

            const stillDisconnectedPlayer =
                room.players.find(
                    p =>
                        p.userId === socket.userId &&
                        p.disconnected
                );

            const stillDisconnectedAudience =
                room.audience.find(
                    a =>
                        a.userId === socket.userId &&
                        a.disconnected
                );

            // REMOVE PLAYER
            if (stillDisconnectedPlayer) {

                room.players =
                    room.players.filter(
                        p => p.userId !== socket.userId
                    );

                // ASK AUDIENCE
                if (room.audience.length > 0) {

                    io.to(roomId).emit(
                        "playerSlotOpen",
                        {
                            role: stillDisconnectedPlayer.role,
                            time: 30
                        }
                    );
                }
            }

            // REMOVE AUDIENCE
            if (stillDisconnectedAudience) {

                room.audience =
                    room.audience.filter(
                        a => a.userId !== socket.userId
                    );
            }

            // UPDATE ROOM
            io.to(roomId).emit("roomUpdate", {
                players: room.players,
                audience: room.audience
            });

            // DELETE EMPTY ROOM
            if (
                room.players.length === 0 &&
                room.audience.length === 0
            ) {

                delete rooms[roomId];

                console.log("Deleted:", roomId);
            }

        }, 10000);
    });
});





// =======================
// START SERVER
// =======================

http.listen(port, () => {
    console.log(
        "Server running on http://localhost:" + port
    );
});

