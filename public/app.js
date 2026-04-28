
const theme = localStorage.getItem("theme");

if (theme === "light") {
  document.body.classList.add("light-mode");
}


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const link = btn.dataset.link;
      if (link) {
        window.location.href = link;
      }
    });
  });
});





/*................led to play game page..........*/

const gameBtn = document.getElementById("playGameBtn");

if(gameBtn){
    gameBtn.onclick = () =>{
        window.location.href = "game-setup.html";
    };
}


// /*..............to diiferent users chats.....................*/

// const chatUsers = document.querySelectorAll(".chat-user");
// const nameBox = document.getElementById("userName");
// const imgBox = document.getElementById("userImg");


// chatUsers.forEach(user => {
//     user.addEventListener("click", () => {

//         chatUsers.forEach(u => u.classList.remove("active"));
//         user.classList.add("active");
    
//         nameBox.textContent = user.querySelector("span").textContent;
//         imgBox.src = user.querySelector("img").src;


//     });
// });


// /* .....................to send the message............................ */

// const sendBtn = document.getElementById("sendBtn");
// const input = document.getElementById("msgInput");
// const messages = document.getElementById("messages");

// sendBtn.onclick = ()=>{

//     const text = input.value.trim();
//         if (!text) return;
//         if (!chats[currentUser]) chats[currentUser] = [];

//         chats[currentUser].push({
//             sender: "me",
//             text: text
//         });
//     localStorage.setItem("chats", JSON.stringify(chats));
//     input.value = "";
//     renderMessages();

// };

// input.addEventListener("keypress", function(e){
//     if(e.key === "Enter"){
//         sendBtn.click();
//     }
// });



// for notification 

document.querySelectorAll(".notification-item").forEach(item => {
item.addEventListener("click", ()=>{
item.classList.remove("unread");
    });
});