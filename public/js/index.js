let selectedUser = ''
let selectedID = ''
const socket = io.connect()

let peer = {}

// const userID = document.getElementById('userID')

const userArea = document.getElementById('userArea')
const messageArea = document.getElementById('messageArea')
const loginButton = document.getElementById('login')
const userName = document.getElementById('userName')
const usersList = document.getElementById('users')
const user = document.getElementById('user')
const chat = document.getElementById('chat')
const remoteVideo = document.getElementById('remote-video')
const localVideo = document.getElementById('local-video')
const videoArea = document.getElementById('video-area')
const startCallButton = document.getElementById('start-call')
const endCallButton = document.getElementById('end-call')

let peerID = ''
let name = ''
let conn = {}

const peerObj = {
  host: '192.168.0.111',
  port: 3000,
  path: '/peerjs',
  debug: 3,
  config: {icerServers: [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com' }
  ]}
}

const constraints = {video: true}

loginButton.onclick = e => {
  e.preventDefault()
  peer = new Peer(peerObj)
  initiatePeerConnection()
}

const initiatePeerConnection = () => {
  peer.on('open', () => {
    // userID.innerHTML = peer.id
    socket.emit('new user',
      {name: userName.value,
        peerID: peer.id},
    data => assignPeerID(data))
  })
  peer.on('connection', connection => {
    conn = connection
    peerID = connection.peer
    if (peerID) {
      alert('accept video call')
      chat.style.display = 'block'
      videoArea.style.display = 'block'
      document.getElementById('connected-peer').innerHTML = 'Connected to: ' + connection.metadata.username
    }
  })
}

const assignPeerID = (data) => {
  if (data) {
    userArea.style.display = 'none'
    messageArea.style.display = 'block'
    user.innerHTML = userName.value
    user.id = peer.id
    userName.value = ''
  }
}

startCallButton.onclick = () => {
  videoArea.style.display = 'block'
  navigator.mediaDevices.getUserMedia(constraints)
  .then(gotStream)
  .then(() => sendOffer())
  .catch(error => {
    console.log(error)
    alert('An error occured. Please try again')
  })
}

// connect to other peer and send an offer
const sendOffer = () => {
  peerID = selectedID
  name = user.innerHTML
  if (peerID) {
    conn = peer.connect(peerID, {metadata: {
      'username': name
    }})
  }
}

const gotStream = stream => {
  window.localStream = stream
  onReceiveStream(stream, 'local-video')
}

const onReceiveStream = (stream, elementID) => {
  var video = document.getElementById(elementID)
  video.srcObject = stream
  window.peerStream = stream
}

socket.on('get users', users => {
  usersList.innerHTML = ''
  users.map(user => {
    const userName = document.createElement('li')
    userName.innerHTML = user.name
    userName.id = user.peerID
    userName.classname = 'list-group-item'
    usersList.appendChild(userName)
    userName.onclick = e => {
      e.preventDefault()
      selectedUser = userName.innerHTML
      selectedID = userName.id
      console.log(selectedUser)
      chat.style.display = 'block'
    }
  })
})
