// ================= CHAT STATE =================

let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentUser = "PlayerOne";

const chatUsers = document.querySelectorAll(".chat-user");
const nameBox = document.getElementById("userName");
const imgBox = document.getElementById("userImg");

const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("msgInput");
const messages = document.getElementById("messages");


// ================= SWITCH USER =================

chatUsers.forEach(user => {
    user.addEventListener("click", () => {

        chatUsers.forEach(u => u.classList.remove("active"));
        user.classList.add("active");

        currentUser = user.querySelector(".chat-name").textContent;

        nameBox.textContent = currentUser;
        imgBox.src = user.querySelector("img").src;

        renderMessages();
    });
});


// ================= RENDER MESSAGES =================

function renderMessages() {
    messages.innerHTML = "";

    const chat = chats[currentUser] || [];

    chat.forEach(m => {
        addMessage(m.sender, m.text, false);
    });

    messages.scrollTop = messages.scrollHeight;
}


// ================= ADD MESSAGE =================

function addMessage(sender, text, save = true) {

    const div = document.createElement("div");
    div.className = "msg " + sender;
    div.textContent = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

    if (save) {
        if (!chats[currentUser]) chats[currentUser] = [];

        chats[currentUser].push({
            sender: sender,
            text: text
        });

        localStorage.setItem("chats", JSON.stringify(chats));
    }
}


// ================= SEND MESSAGE =================

sendBtn.onclick = () => {

    const text = input.value.trim();
    if (!text) return;

    addMessage("me", text);

    input.value = "";

    simulateReply();
};


// ENTER KEY SUPPORT
input.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        sendBtn.click();
    }
});


// ================= TYPING INDICATOR =================

// create typing element once
const typing = document.createElement("div");
typing.className = "msg other";
typing.style.opacity = "0.7";
typing.style.fontStyle = "italic";
typing.style.display = "none";
typing.textContent = "typing...";

messages.appendChild(typing);


// ================= SIMULATED REPLY =================

function simulateReply() {

    typing.style.display = "block";
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {

        typing.style.display = "none";

        let reply;

        if (currentUser === "GameMaster") {
            reply = "Tournament starting soon!";
        } 
        else if (currentUser === "ChessKing") {
            reply = "Let's play chess ♟️";
        } 
        else if (currentUser === "PlayerOne") {
            reply = "Ready for tonight's game?";
        } 
        else {
            reply = "Okay 👍";
        }

        addMessage("other", reply);

    }, 1500);
}


// ================= INIT =================

renderMessages();