const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { Chess } = require("chess.js");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const users = [];
const rooms = {};

// =======================
// LOGIN
// =======================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const user = users.find(

        u =>
            u.username === username &&
            u.password === password
    );

    if (!user) {

        return res.json({

            success: false,
            message: "Invalid credentials"
        });
    }

    res.json({

        success: true,
        username
    });
});

// =======================
// SIGNUP
// =======================

app.post("/signup", (req, res) => {

    const { username, password } = req.body;

    const exists = users.find(

        u => u.username === username
    );

    if (exists) {

        return res.json({

            success: false,
            message: "Username already exists"
        });
    }

    users.push({

        username,
        password
    });

    res.json({

        success: true
    });
});

// =======================
// HOME
// =======================

app.get("/", (req, res) => {

    res.sendFile(

        path.join(
            __dirname,
            "public",
            "home.html"
        )
    );
});

// =======================
// SOCKET CONNECTION
// =======================

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // =======================
    // JOIN ROOM
    // =======================

    socket.on("joinRoom", ({

        roomId,
        username

    }) => {

        socket.join(roomId);
        socket.username = username;

        // CREATE ROOM

        if (!rooms[roomId]) {
            rooms[roomId] = {

                game: new Chess(),
                whiteTeam: [],
                blackTeam: [],
                votes: {},
                activeWhiteMover: null,
                activeBlackMover: null
            };
        }

        const room = rooms[roomId];

        // AUTO TEAM BALANCE

        let role = "white";

        if ( room.whiteTeam.length > room.blackTeam.length) {

            role = "black";
        }

        const user = {

            id: socket.id,
            username,
            role
        };

        // ADD PLAYER

        if (role === "white") {

            room.whiteTeam.push(user);

        } else {

            room.blackTeam.push(user);
        }

        // SEND ROLE

        socket.emit(
            "roleAssigned",
            role
        );

        // SEND GAME STATE

        socket.emit(
            "gameState",
            {

                fen:
                    room.game.fen(),

                history:
                    room.game.history(),

                turn:
                    room.game.turn()
            }
        );

        // SEND ROOM UPDATE

        io.to(roomId).emit(
            "roomUpdate",
            {

                whiteTeam:
                    room.whiteTeam,

                blackTeam:
                    room.blackTeam,

                votes:
                    room.votes,

                activeWhiteMover:
                    room.activeWhiteMover,

                activeBlackMover:
                    room.activeBlackMover,

                fen:
                    room.game.fen(),

                history:
                    room.game.history(),

                turn:
                    room.game.turn()
            }
        );
    });

    // =======================
    // MOVE
    // =======================

    socket.on("move", ({

        roomId,
        source,
        target

    }) => {

        const room = rooms[roomId];

        if (!room) return;

        // PREVENT SAME SQUARE

        if (source === target) {

            socket.emit("invalidMove");

            return;
        }

        let move = null;

        try {

            move = room.game.move({

                from: source,
                to: target,
                promotion: "q"
            });

        } catch (err) {

            console.log(
                "Invalid move:",
                err.message
            );

            socket.emit(
                "invalidMove"
            );

            return;
        }

        if (!move) {

            socket.emit(
                "invalidMove"
            );

            return;
        }

        // RESET ACTIVE MOVER AFTER MOVE

            if (move.color === "w") {

                room.activeWhiteMover = null;

            } else {

                room.activeBlackMover = null;
            }

        io.to(roomId).emit(
            "movePlayed",
            {

                fen:
                    room.game.fen(),

                history:
                    room.game.history(),

                turn:
                    room.game.turn()
            }
        );
    });

    // =======================
    // CHAT
    // =======================

    socket.on("chatMessage", ({

        roomId,
        role,
        message

    }) => {

        io.to(roomId).emit(
            "chatMessage",
            {

                username: socket.username || "Player", 
                role,
                message,
                time:
                Date.now()
            }
        );
    });

    // =======================
    // TYPING
    // =======================

    socket.on("typing", ({

        roomId,
        username

    }) => {

        socket.to(roomId).emit(
            "typing",
            {
                username
            }
        );
    });

    // =======================
    // CLAIM MOVE
    // =======================

    socket.on("claimMove", ({

        roomId

    }) => {

        const room = rooms[roomId];

        if (!room) return;

        const player =

            room.whiteTeam.find(
                p => p.id === socket.id
            )

            ||

            room.blackTeam.find(
                p => p.id === socket.id
            );

        if (!player) return;

        if (player.role === "white") {

             room.activeWhiteMover = {
                id: socket.id,
                username: player.username
            };
             
        } else {

           room.activeBlackMover = {
                id: socket.id,
                username: player.username
            };
        }

        io.to(roomId).emit(
            "roomUpdate",
            {

                whiteTeam:
                    room.whiteTeam,

                blackTeam:
                    room.blackTeam,

                votes:
                    room.votes,

                activeWhiteMover:
                    room.activeWhiteMover,

                activeBlackMover:
                    room.activeBlackMover,

                fen:
                    room.game.fen(),

                history:
                    room.game.history(),

                turn:
                    room.game.turn()
            }
        );
    });

    // =======================
    // VOTE MOVE
    // =======================

    socket.on("voteMove", ({

        roomId,
        move

    }) => {

        const room = rooms[roomId];

        if (!room) return;

        if (!room.votes[move]) {

            room.votes[move] = 0;
        }

        room.votes[move]++;

        io.to(roomId).emit(
            "voteUpdate",
            room.votes
        );
    });

    // =======================
    // GAME ENDED
    // =======================

    socket.on("gameEnded", ({

        roomId,
        winner,
        type

    }) => {

        io.to(roomId).emit(
            "gameEnded",
            {

                winner,
                type
            }
        );
    });

    // =======================
    // RESTART GAME
    // =======================

    socket.on("restartGame", ({

        roomId

    }) => {

        const room = rooms[roomId];

        if (!room) return;

        room.game = new Chess();

        room.votes = {};

        io.to(roomId).emit(
            "restartGame"
        );
    });

    // =======================
    // DISCONNECT
    // =======================

    socket.on("disconnect", () => {

        Object.values(rooms).forEach(room => {

            room.whiteTeam =
                room.whiteTeam.filter(
                    p => p.id !== socket.id
                );

            room.blackTeam =
                room.blackTeam.filter(
                    p => p.id !== socket.id
                );
        });

        console.log(
            "Disconnected:",
            socket.id
        );
    });
});

// =======================
// START SERVER
// =======================

const PORT = 8080;

server.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );
});