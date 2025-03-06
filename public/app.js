const socket = io(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://localhost:3500" 
    : "/")

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')


function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        })
        msgInput.value = ""
    }
    msgInput.focus()
}

function enterRoom(e){
    e.preventDefault()
    if (nameInput.value && chatRoom.value){
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})


let activityTimer;
let typingIndicator = null;

// Listen for messages 
socket.on("message", (data) => {

    if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
    }
    
    const { name, text, time } = data;
    const li = document.createElement('li');
    li.className = 'post';
    if (name === nameInput.value) li.className = 'post post--left';
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right';
    
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header
        ${name === nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>
        `;
    } else {
        li.innerHTML = `<div class="post__text-admin">${text}</div>`;
    }
    
    chatDisplay.appendChild(li);
});



socket.on("activity", () => {
    if (!typingIndicator) {
        typingIndicator = document.createElement('li');
        typingIndicator.className = 'chat-bubble-container';
        typingIndicator.innerHTML = `
            <div class="chat-bubble">
                <div class="typing">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        // Add to the chat display
        chatDisplay.appendChild(typingIndicator);
    } else {
        // If it was previously hidden, show it again
        typingIndicator.style.display = 'block';
    }

    // Reset the timer
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (typingIndicator) {
            // Hide instead of removing
            typingIndicator.style.display = 'none';
        }
    }, 3000);
});

function showUsers(users){
    usersList.textContent = ''
    if (users){
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1){
                usersList.textContent += ","
            }
        })
    }
}

function showRooms(rooms){
    usersList.textContent = ''
    if (rooms){
        roomList.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1){
                roomList.textContent += ","
            }
        })
    }
}