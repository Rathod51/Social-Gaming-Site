// =======================
// CHAT SYSTEM
// =======================


    export function initChat({ socket, roomId, getUserColor }) {

        const chatBox = document.getElementById("chatBox");
        const chatToggleBtn = document.getElementById("chatToggleBtn");
        const chatInput = document.getElementById("chatInput");
        const sendBtn = document.getElementById("sendBtn");
        const messages = document.getElementById("messages");
        const typingIndicator = document.getElementById("typingIndicator");

        let typingTimeout;

        // CHAT BUTTON

           if (chatToggleBtn && chatBox) {
                chatToggleBtn.onclick = () => {
                    chatBox.style.display =
                        chatBox.style.display === "flex" ? "none" : "flex";
                };
            } 

            
        // SEND
            if (sendBtn && chatInput) {
                sendBtn.onclick = sendMessage;
                
                chatInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") sendMessage();
                });

            }


            function sendMessage() {
                const msg = chatInput.value.trim();
                if (!msg) return;

                socket.emit("chatMessage", { roomId, message: msg });
                chatInput.value = "";
            }

        // RECEIVE
            socket.off("chatMessage").on("chatMessage", ({ username, role, message }) => {

                console.log("Me:", socket.username, "Sender:", username);

                const div = document.createElement("div");
                const isMe = username === socket.username;

                div.className = isMe ? "message me" : "message other";

                const nameColor = getUserColor(username);

                const time = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

                div.innerHTML = `
                    <div class="msgHeader">
                        <span style="color:${nameColor}">${username}</span>
                        <small>${time}</small>
                    </div>
                    <div class="msgText">${message}</div>
                `;

                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
                
            });

// =======================
// TYPING INDICATOR
// =======================

    // SEND TYPING...
        if(chatInput){
            chatInput.addEventListener("input", () => {
                socket.emit("typing", { roomId });
            });
        }
        
    //RECEIVE TYPING...
        socket.on("typing", (username) => {

            if (!typingIndicator) return;
            if (username === socket.username) return;

            typingIndicator.innerText = `${username} is typing...`;

            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(() => {
                typingIndicator.innerText = "";
            }, 1200);
        });


        
}