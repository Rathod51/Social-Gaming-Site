

function initTimer({ socket, roomId }) {

    let whiteTime = 300; // 5 min
    let blackTime = 300;

    let currentTurn = "white";
    let timerInterval = null;

    const whiteEl = document.getElementById("whiteTimer");
    const blackEl = document.getElementById("blackTimer");

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    function updateUI() {
        whiteEl.innerText = formatTime(whiteTime);
        blackEl.innerText = formatTime(blackTime);

        whiteEl.classList.toggle("activeTimer", currentTurn === "white");
        blackEl.classList.toggle("activeTimer", currentTurn === "black");
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {

            if (currentTurn === "white") {
                whiteTime--;
            } else {
                blackTime--;
            }

            updateUI();

            // ⛔ TIME OUT
            if (whiteTime <= 0 || blackTime <= 0) {
                clearInterval(timerInterval);

                const winner = whiteTime <= 0 ? "Black" : "White";
                alert(`${winner} wins on time!`);
            }

        }, 1000);
    }

    // =======================
    // SOCKET EVENTS
    // =======================

    socket.on("timerUpdate", (data) => {
        whiteTime = data.white;
        blackTime = data.black;
        currentTurn = data.turn;
        updateUI();
    });

    socket.on("startTimer", (data) => {
        whiteTime = data.white;
        blackTime = data.black;
        currentTurn = data.turn;
        updateUI();
        startTimer();
    });

    // =======================
    // EMIT TURN SWITCH
    // =======================

    function switchTurn() {
        currentTurn = currentTurn === "white" ? "black" : "white";

        socket.emit("timerMove", {
            roomId,
            white: whiteTime,
            black: blackTime,
            turn: currentTurn
        });
    }

    // expose function
    return {
        switchTurn
    };
}