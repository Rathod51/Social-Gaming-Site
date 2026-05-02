let role = "";

document.getElementById("playerBtn").onclick = () => {
    role = "player";
    showNext();
};

document.getElementById("audienceBtn").onclick = () => {
    role = "audience";
    showNext();
};

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