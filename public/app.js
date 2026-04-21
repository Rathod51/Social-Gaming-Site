// ..........home page operations................

/*................led to play game page..........*/

const gameBtn = document.getElementById("playGameBtn");

if(gameBtn){
    gameBtn.onclick = () =>{
        window.location.href = "game-setup.html";
    };
}

/*.......................to like the post...............*/


document.querySelectorAll(".post").forEach(post => {

    const icon = post.querySelector(".fa-heart");
    const likeCount = post.querySelector(".like-count");

    let liked = false;
    let count = 0;

    icon.addEventListener("click", () => {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");

        liked = !liked;
        count += liked ? 1 : -1;

        likeCount.textContent = count;
    });

});

/*.......................comment on the post...............*/

document.querySelectorAll(".post").forEach(post => {

    const commentBtn = post.querySelector(".fa-comment");
    const commentSection = post.querySelector(".comment-section");
    const input = post.querySelector(".comment-input");
    const list = post.querySelector(".comment-list");
    const postBtn = post.querySelector(".post-comment");

    commentBtn.addEventListener("click", () => {
        commentSection.style.display =
            commentSection.style.display === "none" ? "block" : "none";
    });

    postBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) return;

        const div = document.createElement("div");
        div.textContent = text;

        list.appendChild(div);
        input.value = "";
    });

});

/*.......................to share the post...............*/

document.querySelectorAll(".post").forEach(post => {

    const shareBtn = post.querySelector(".fa-paper-plane");
    const shareBox = post.querySelector(".share-box");

    shareBtn.addEventListener("click", () => {
        shareBox.style.display =
            shareBox.style.display === "none" ? "block" : "none";
    });

    post.querySelectorAll(".share-user").forEach(user => {
        user.addEventListener("click", () => {
            alert("Shared with " + user.textContent);
        });
    });

});


/*.......................to save the post...............*/

document.querySelectorAll(".fa-bookmark").forEach(icon => {

    let saved = false;

    icon.addEventListener("click", () => {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
        saved = !saved;
    });
});




    
/*..............to diiferent users chats.....................*/

const chatUsers = document.querySelectorAll(".chat-user");
const nameBox = document.getElementById("userName");
const imgBox = document.getElementById("userImg");


chatUsers.forEach(user => {
    user.addEventListener("click", () => {

        chatUsers.forEach(u => u.classList.remove("active"));
        user.classList.add("active");
    
        nameBox.textContent = user.querySelector("span").textContent;
        imgBox.src = user.querySelector("img").src;


    });
});


/* .....................to send the message............................ */

const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("msgInput");
const messages = document.getElementById("messages");

sendBtn.onclick = ()=>{

    if(input.value.trim() === "") return;
    let msg = document.createElement("div");

    msg.className="msg me";
    msg.textContent=input.value;
    messages.appendChild(msg);
    input.value="";

    messages.scrollTop=messages.scrollHeight;

};

input.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        sendBtn.click();
    }
});



/* ........................for reel scroling..................*/

// const videos = document.querySelectorAll(".reel-video");

// const observer = new IntersectionObserver((entries)=>{
//     entries.forEach(entry=>{
//         if(entry.isIntersecting){
//             entry.target.play();
//         } else {
//             entry.target.pause();
//         }
//     });
// },{threshold:0.7});

// videos.forEach(video=>observer.observe(video));



// for notification 

document.querySelectorAll(".notification-item").forEach(item => {
item.addEventListener("click", ()=>{
item.classList.remove("unread");
    });
});