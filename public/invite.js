
const theme = localStorage.getItem("theme");

if (theme === "light") {
  document.body.classList.add("light-mode");
}

const players = [
  "PlayerOne",
  "GameMaster",
  "ChessKing",
  "LudoQueen",
  "ProGamer",
  "ShadowX",
  "NoobMaster",
  "FirePlayer"
];

const playerList = document.getElementById("playerList");
const searchInput = document.getElementById("searchInput");

let invited = JSON.parse(localStorage.getItem("invited")) || [];

// render list
function renderPlayers(list){
  playerList.innerHTML = "";

  list.forEach(name => {

    const div = document.createElement("div");
    div.className = "player";

    const isInvited = invited.includes(name);

    div.innerHTML = `
      <span>${name}</span>
      <button class="${isInvited ? "invited" : ""}">
        ${isInvited ? "Invited" : "Invite"}
      </button>
    `;

    const btn = div.querySelector("button");

    btn.addEventListener("click", () => {
      if(!invited.includes(name)){
        invited.push(name);
        localStorage.setItem("invited", JSON.stringify(invited));
        renderPlayers(players);
      }
    });

    playerList.appendChild(div);
  });
}

// search
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = players.filter(p =>
    p.toLowerCase().includes(value)
  );

  renderPlayers(filtered);
});

// init
renderPlayers(players);