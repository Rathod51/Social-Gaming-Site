export function initGameEnd({
    chess,
    socket,
    roomId,
    getBoard
}) {

    const modal = document.getElementById("gameResultModal");
    const resultText = document.getElementById("gameResultText");
    const newGameBtn =document.getElementById("newGameBtn");
    const exitGameBtn = document.getElementById("exitGameBtn");

    // CHECK GAME END

    function checkGameEnd() {

        if (chess.in_checkmate()) {
            const winner = chess.turn() === "w"? "BLACK" : "WHITE";

            showResult(`${winner} WINS`);
            socket.emit("gameEnded", {
                roomId,
                winner,
                type: "checkmate"
            });
        }
        else if (chess.in_draw()) {
            showResult("DRAW");
            socket.emit("gameEnded", {
                roomId,
                winner: "draw",
                type: "draw"
            });
        }
    }

    // SHOW RESULT

    function showResult(text) {

        if (!modal || !resultText) return;

        resultText.innerText = text;

        modal.classList.remove("hidden");
    }

    // SOCKET RESULT

    socket.on("gameEnded", ({
        winner,
        type
    }) => {

        if (type === "draw") {

            showResult("DRAW");

        } else {

            showResult(`${winner} WINS`);
        }
    });

    // NEW GAME

    if (newGameBtn) {

        newGameBtn.addEventListener("click", () => {

            socket.emit("restartGame", {
                roomId
            });
        });
    }

    // EXIT

    if (exitGameBtn) {

        exitGameBtn.addEventListener("click", () => {

            window.location.href = "home.html";
        });
    }

    // RESTART

    socket.on("restartGame", () => {

        chess.reset();

        const board = getBoard();

        if (board) {

            board.position(chess.fen());

        }

        modal.classList.add("hidden");

        if (window.updateMoveHistory) {

            window.updateMoveHistory();
        }
    });

    return {
        checkGameEnd
    };
}