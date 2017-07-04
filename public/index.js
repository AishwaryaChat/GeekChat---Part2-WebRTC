window.onload = () => {
  const socket = io.connect()
  const userArea = document.getElementById('userArea')
  const messageArea = document.getElementById('messageArea')
  const submitUser = document.getElementById('submitUser')
  const userName = document.getElementById('userName')
  const usersList = document.getElementById('users')
  const chat = document.getElementById('chat')
  const videoArea = document.getElementById('video-area')
  const startButton = document.getElementById('start_call')
  const remoteVideo = document.getElementById('remote_video')
  const localVideo = document.getElementById('local_video')

  const getUserMedia = (navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia)

  let selectedUser = ''

  submitUser.onclick = e => {
    e.preventDefault()
    socket.emit('new user', userName.value, data => {
      if (data) {
        userArea.style.display = 'none'
        messageArea.style.display = 'block'
        const user = document.getElementById('user')
        user.innerHTML = userName.value
        userName.value = ''
      }
    })
  }

  startButton.onclick = () => {
    videoArea.style.display = 'block'
    const constraints = {video: 'true', audio: 'true'}
    getUserMedia(constraints, gotStream, errorStream)
    let peerConnection = new RTCPeerConnection({iceServers: [{'urls': 'stun:' + stunServer}]})
  }

  const gotStream = stream => {
    connectStreamToSrc(stream, localVideo)
  }

  const errorStream = error => console.log(error)

  socket.on('get users', users => {
    usersList.innerHTML = ''
    users.map(user => {
      const userName = document.createElement('li')
      userName.innerHTML = `<span>${user.name}</span>`
      userName.id = user.name
      userName.classname = 'list-group-item'
      usersList.appendChild(userName)
      userName.onclick = e => {
        e.preventDefault()
        selectedUser = userName.id
        chat.style.display = 'block'
      }
    })
  })
}
