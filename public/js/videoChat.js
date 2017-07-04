const videoArea = document.getElementById('video-area')
const startButton = document.getElementById('start_call')
const remoteVideo = document.getElementById('remote_video')
const localVideo = document.getElementById('local_video')

let myPeerConnection = null
let myHostname = window.location.hostname

startButton.onclick = () => {
  videoArea.style.display = 'block'
  const constraints = {video: 'true', audio: 'true'}

  createPeerConnection()

  getUserMedia(constraints, gotStream, errorStream)
}

const createPeerConnection = () => {
  console.log('inside createPeerConnection, setting up connection')
  // Create an RTCPeerConnection which knows to use our chosen
  // STUN server.
  myPeerConnection = new RTCPeerConnection({iceServers: [{'urls': 'stun:' + stunServer}]})

  myPeerConnection.onicecandidate = handleICECandidateEvent
  myPeerConnection.onaddstream = handleAddStreamEvent // to add remote stream on local remoteVideo element, one a stream is received
}

const handleICECandidateEvent = event => {
  console.log('handleICECandidateEvent', event)
  if(event.candidate) {
    sendToServer({
      type: 'new-ice-candidate',
      target: selectedUser,
      candidate: event.candidate
    })
  }
}

const handleAddStreamEvent = event => {
  connectStreamToSrc(event.stream, remoteVideo)
}

const gotStream = stream => {
  connectStreamToSrc(stream, localVideo)
  myPeerConnection.addStream(stream)
}

const errorStream = error => {
  console.log(error)
  // close video call if an error happens
  // closeVideoCall()
}

const sendToServer = msg => {
  msg = JSON.stringify(msg)
  socket.emit('message', msg)
}
