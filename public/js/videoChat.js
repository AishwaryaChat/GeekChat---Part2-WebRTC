const videoArea = document.getElementById('video-area')
const startButton = document.getElementById('start_call')
const remoteVideo = document.getElementById('remote_video')
const localVideo = document.getElementById('local_video')

const constraints = {video: 'true', audio: 'true'}
let myPeerConnection = null
var targetUsername = null
let myHostname = window.location.hostname

startButton.onclick = () => {
  videoArea.style.display = 'block'

  createPeerConnection() // create a RTCPeerConnection object to make a call

  getUserMedia(constraints, gotStream, errorStream)
}

const createPeerConnection = () => {
  // console.log('inside createPeerConnection, setting up connection')
  // Create an RTCPeerConnection which knows to use our chosen
  // STUN server.
  myPeerConnection = new RTCPeerConnection({iceServers: [{'urls': 'stun:' + stunServer}]})

  myPeerConnection.onicecandidate = handleICECandidateEvent
  myPeerConnection.onaddstream = handleAddStreamEvent // to add remote stream on local remoteVideo element, one a stream is received
  myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent
}

const handleICECandidateEvent = event => {
  // console.log('handleICECandidateEvent', event)
  if (event.candidate) {
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

const handleNegotiationNeededEvent = event => {
  myPeerConnection.createOffer()
  .then(offer => myPeerConnection.setLocalDescription(offer))
  .then(() => {
    sendToServer({
      name: user.innerHTML,
      target: selectedUser,
      type: 'video-offer',
      sdp: myPeerConnection.localDescription
    })
  })
  .catch(reportError)
}

const reportError = error => {
  console.log(('Error ' + error.name + ': ' + error.message))
}

socket.on('accept video', msg => {
  switch(msg.type) {
    case 'video-offer': // Invitation and offer to chat
        handleVideoOfferMsg(msg)
        break
  }
})

const handleVideoOfferMsg = msg => {
  targetUsername = msg.name
  createPeerConnection()
  const remoteDescription = new RTCSessionDescription(msg.sdp)
  myPeerConnection.setRemoteDescription(remoteDescription)
  .then(() => getUserMedia(constraints))
  .then(stream => {
    localVideo.srcObject = stream
    return myPeerConnection.addStream(stream)
  })
  .then(() => myPeerConnection.createAnswer())
  .then(answer => myPeerConnection.setLocalDescription(answer))
  .then(() => {
    sendToServer({
      name: userName.id,
      target: targetUsername,
      type: 'video-answer',
      sdp: myPeerConnection.localDescription
    })
  })
  .catch(error => console.log(error))
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
  console.log(msg.type)
  msg = JSON.stringify(msg)
  socket.emit('message', msg)
}
