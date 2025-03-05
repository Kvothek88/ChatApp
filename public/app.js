const socket = io('http://192.168.2.2:3500')

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

function moveTypingIndicatorToEnd() {
    if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.appendChild(typingIndicator);
    }
}

// Listen for messages 
socket.on("message", (data) => {
    // Clear any typing indicator text (from your original code)
    if (activity) activity.textContent = "";

    if (typingIndicator) {
    typingIndicator.style.display = 'none';
    clearTimeout(activityTimer); // Stop any pending timeout
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
    
    // Move typing indicator to the end if it exists
    moveTypingIndicatorToEnd();
    
    // Scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

socket.on("activity", () => {
    // If typing indicator doesn't exist yet, create it
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
        
        // Ensure it's at the end
        moveTypingIndicatorToEnd();
    }
    
    // Scroll to bottom when typing indicator appears
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    
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