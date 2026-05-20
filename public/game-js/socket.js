export function initSocketHandlers({

    socket,
    chess,
    getBoard,
    checkGameEnd,
    setPlayerRole

}) {

    // =======================
    // ROLE ASSIGNED
    // =======================

    socket.on("roleAssigned", (role) => {

        setPlayerRole(role);

        const board = getBoard();

        if (board) {

            board.orientation(role);
        }
    });

    // =======================
    // GAME STATE
    // =======================

    socket.on("gameState", ({

        fen,
        history

    }) => {

        chess.load(fen);

        const board = getBoard();

        if (board) {

            board.position(fen);
        }

        if (window.updateMoveHistory) {

            window.updateMoveHistory(history);
        }
    });

    // =======================
    // MOVE PLAYED
    // =======================

    socket.on("movePlayed", ({

        fen,
        history

    }) => {

        chess.load(fen);

        const board = getBoard();

        if (board) {

            board.position(fen);
        }

        if (window.updateMoveHistory) {

            window.updateMoveHistory(history);
        }

        checkGameEnd();
    });

    // =======================
    // INVALID MOVE
    // =======================

    socket.on("invalidMove", () => {

        const board = getBoard();

        if (board) {

            board.position(chess.fen());
        }
    });

    // =======================
    // ROOM UPDATE
    // =======================

    socket.on("roomUpdate", ({

        whiteTeam,
        blackTeam,
        activeWhiteMover,
        activeBlackMover,
        turn

    }) => {

        // STORE ACTIVE MOVERS

        window.activeWhiteMover = activeWhiteMover;

        window.activeBlackMover = activeBlackMover;

        // TEAM LISTS

        const whitePlayers = document.getElementById("whiteTeam");
        const blackPlayers = document.getElementById("blackTeam");

        if (whitePlayers) {

            whitePlayers.innerHTML = "";
            whiteTeam.forEach(user => {

                const card = window.createUserCard(user);

                // ACTIVE WHITE PLAYER

                if ( activeWhiteMover && activeWhiteMover.id === user.id) {
                    card.classList.add("activePlayer");
                }
                whitePlayers.appendChild(card);
            });
        }

        if (blackPlayers) {

            blackPlayers.innerHTML = "";
            blackTeam.forEach(user => {

                const card = window.createUserCard(user);

                // ACTIVE BLACK PLAYER

                if (activeBlackMover && activeBlackMover.id === user.id) {

                    card.classList.add("activePlayer");
                }
                blackPlayers.appendChild(card);
            });
        }

        // TURN BANNER

        const turnBanner = document.getElementById("turnBanner");

        if (turnBanner) {

            turnBanner.innerText =
                turn === "w"
                ? "WHITE TEAM TURN"
                : "BLACK TEAM TURN";
        }

        // ACTIVE MOVER TEXT

        const activeMoverText = document.getElementById("activeMoverText");
           
        if (activeMoverText) {

            if (turn === "w") {

                activeMoverText.innerText =activeWhiteMover? activeWhiteMover.username : "No active mover";
            } else {

                activeMoverText.innerText = activeBlackMover? activeBlackMover.username: "No active mover";
            }          
        }
    });

    // =======================
    // VOTE UPDATE
    // =======================

    socket.on("voteUpdate", (votes) => {

        const voteBox =
            document.getElementById(
                "voteResults"
            );

        if (!voteBox) return;

        voteBox.innerHTML = "";

        Object.entries(votes)
        .forEach(([move, count]) => {

            const div =
                document.createElement("div");

            div.innerText =`${move}: ${count}`;

            voteBox.appendChild(div);
        });
    });
}

