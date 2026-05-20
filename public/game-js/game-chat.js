export function initChat({ socket, roomId, role }) {

    const chatToggleBtn = document.getElementById("chatToggleBtn");
    const chatBox = document.getElementById("chatBox");

    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");

    const chatMessages = document.getElementById("chatMessages");
    const typingIndicator = document.getElementById("typingIndicator");

    // CHAT TOGGLE

    if (chatToggleBtn && chatBox) {

        chatToggleBtn.addEventListener("click", () => {
            chatBox.classList.toggle("hidden");

        });
    }

    // SEND MESSAGE

    function sendMessage() {

        const message = chatInput.value.trim();
        if (!message) return;
        socket.emit("chatMessage", {
            roomId,
            role,
            message
        });
        chatInput.value = "";
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    // ENTER KEY

    if (chatInput) {
        chatInput.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // RECEIVE MESSAGE

    socket.on("chatMessage", ({ username, message, time }) => {
        if (!chatMessages) return;
        const bubble = document.createElement("div");
        bubble.classList.add("message");
        if (username === window.username) {
            bubble.classList.add("me");
        } else {
            bubble.classList.add("other");
        }
        
        const date = new Date(time);
        const formattedTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        bubble.innerHTML = `
            <div class="msgHeader">
                <span>${username}</span>
                <span>${formattedTime}</span>
            </div>

            <div class="msgText">${message}</div>
        `;

        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // TYPING

    let typingTimeout;

    if (chatInput) {

        chatInput.addEventListener("input", () => {
            socket.emit("typing", {
                roomId,
                role,
                username: window.username
            });

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                typingIndicator.innerText = "";
            }, 1000);
        });
    }

    socket.on("typing", ({ username }) => {
        if (username === window.username) return;
        typingIndicator.innerText =`${username} is typing...`;

        clearTimeout(window.typingClear);
        window.typingClear = setTimeout(() => {
            typingIndicator.innerText = "";
        }, 1200);
    });

    
    sendBtn.onclick = () => {

        const msg =chatInput.value.trim();

        if (!msg) return;
        socket.emit("chatMessage", {
            roomId,
            role,
            message: msg
        });

        addMessage({
            username:window.username,
            message: msg,
            time: Date.now()
        });

        chatInput.value = "";
        chatInput.focus();
    };
    
};
