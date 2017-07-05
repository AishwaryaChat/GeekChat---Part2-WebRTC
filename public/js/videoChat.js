const videoArea = document.getElementById('video-area')
const startButton = document.getElementById('start_call')
const remoteVideo = document.getElementById('remote_video')
const localVideo = document.getElementById('local_video')

const constraints = {video: 'true'}
let myPeerConnection = null
var targetUsername = null
let myHostname = window.location.hostname

startButton.onclick = () => {
  videoArea.style.display = 'block'

  createPeerConnection() // create a RTCPeerConnection object to make a call

  navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    localVideo.srcObject = stream
    myPeerConnection.addStream(stream)
  })
  .catch(error => console.log(error))
  // getUserMedia(constraints, gotStream, errorStream)
}

const createPeerConnection = () => {
  // console.log('inside createPeerConnection, setting up connection')
  // Create an RTCPeerConnection which knows to use our chosen
  // STUN server.
  myPeerConnection = new RTCPeerConnection({iceServers: [{'urls': 'stun:stun.l.google.com:19302'}]})

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
  remoteVideo.srcObject = event.stream
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
  .catch(error => {
    console.log(error)
    myPeerConnection.close()
  })
}

const reportError = error => {
  console.log(('Error ' + error.name + ': ' + error.message))
}

const errorStream = error => {
  console.log(error)
  // close video call if an error happens
  // closeVideoCall()
}

const sendToServer = msg => {
  console.log(msg.type)
  socket.emit('message', msg)
}

socket.on('message', msg => {
  switch (msg.type) {
    case 'new-ice-candidate':
      handleNewICECandidateMsg(msg)
    break

    case 'video-offer':
      handleVideoOfferMsg(msg)
    break

    case 'video-answer':
      handleVideoAnswerMsg(msg)
    break

    default:
      console.log('Nothing Matched')
    break
  }
})

// A new ICE candidate has been received from the other peer. Call
// RTCPeerConnection.addIceCandidate() to send it along to the
// local ICE framework.
const handleNewICECandidateMsg = msg => {
  console.log('inside handleNewICECandidateMsg', msg.candidate)
  const candidate = new RTCIceCandidate(msg.candidate)
  myPeerConnection.addIceCandidate(candidate)
  .catch(error => {
    console.log(error)
    myPeerConnection.close()
  })
}

const handleVideoOfferMsg = msg => {
  videoArea.style.display = 'block'
  targetUsername = msg.name
  createPeerConnection()
  if (myPeerConnection !== null) {
    const remoteDescription = new RTCSessionDescription(msg.sdp)
    myPeerConnection.setRemoteDescription(remoteDescription)
    .then(() => navigator.mediaDevices.getUserMedia(constraints))
    .then(stream => {
      localVideo.srcObject = stream
      myPeerConnection.addStream(stream)
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
    .catch(error => {
      console.log(error)
      myPeerConnection.close()
    })
  }
  // .then(() => getUserMedia(constraints,
  //   stream => {
  //     localVideo.srcObject = stream
  //     myPeerConnection.addStream(stream)
  //     myPeerConnection.createAnswer()
  //     .then(answer => myPeerConnection.setLocalDescription(answer))
  //     .then(() => {
        // sendToServer({
        //   name: userName.id,
        //   target: targetUsername,
        //   type: 'video-answer',
        //   sdp: myPeerConnection.localDescription
        // })
  //     })
  //     .catch(error => console.log(error))
  //   },
  //   error => console.log(error)
  // ))
}

// Responds to the "video-answer" message sent to the caller
// once the callee has decided to accept our request to talk.
const handleVideoAnswerMsg = msg => {
  console.log('inside handleVideoAnswerMsg')
  createPeerConnection()
  const remoteDescription = new RTCSessionDescription(msg.sdp)
  myPeerConnection.setRemoteDescription(msg.sdp)
  .catch(error => {
    console.log(error)
    myPeerConnection.close()
  })
}

const gotStream = stream => {
  connectStreamToSrc(stream, localVideo)
  myPeerConnection.addStream(stream)
}
