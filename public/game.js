let role = "";

document.getElementById("whiteBtn").onclick = () => {
    role = "white";
    showNext();
};

document.getElementById("blackeBtn").onclick = () => {
    role = "black";
    showNext();
};


// =======================
// SHOW GAME SELECT
// =======================


function showNext(){
    document.getElementById("q1").style.display = "none";
    document.getElementById("q2").style.display = "block";
}

document.getElementById("startBtn").onclick = () => {
    const game = document.getElementById("gameSelect").value;

    if(game === "chess"){
        window.location.href = `chess.html?role=${role}`;
    }
};