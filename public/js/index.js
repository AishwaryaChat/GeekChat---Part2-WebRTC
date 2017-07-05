let selectedUser = ''
const socket = io.connect()

let peer = {}

// const userID = document.getElementById('userID')

const userArea = document.getElementById('userArea')
const messageArea = document.getElementById('messageArea')
const loginButton = document.getElementById('login')
const userName = document.getElementById('userName')
const usersList = document.getElementById('users')
const chat = document.getElementById('chat')

loginButton.onclick = e => {
  e.preventDefault()
  peer = new Peer({
    host: 'localhost',
    port: 3000,
    path: '/peerjs',
    debug: 3,
    config: {icerServers: [
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com' }
    ]}
  })
  peer.on('open', () => {
    console.log('new user')
    // userID.innerHTML = peer.id
    socket.emit('new user',
      {name: userName.value,
        peerID: peer.id},
    data => {
      if (data) {
        userArea.style.display = 'none'
        messageArea.style.display = 'block'
        const user = document.getElementById('user')
        user.innerHTML = userName.value
        user.id = peer.id
        userName.value = ''
      }
    })
  })
}

socket.on('get users', users => {
  usersList.innerHTML = ''
  users.map(user => {
    const userName = document.createElement('li')
    userName.innerHTML = `<span>${user.name}</span>`
    userName.id = user.peerID
    userName.classname = 'list-group-item'
    usersList.appendChild(userName)
    userName.onclick = e => {
      e.preventDefault()
      selectedUser = userName.id
      chat.style.display = 'block'
    }
  })
})
