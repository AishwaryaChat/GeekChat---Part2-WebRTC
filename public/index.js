let callToken = '' // unique token for a particular call
let signalingServer = '' // signalling server for a particular call
let peerConnection = {} // the actual RTCPeerConnection object, that will be established between 2 users

const remoteVideo = document.getElementById('remote_video')
const localVideo = document.getElementById('local_video')
const loadingState = document.getElementById('loading_state')

body.onload = () => {
  // creates the WebRTC peer connection object
  peerConnection = new rtcPeerConnection({
    iceServers: [{'url': 'stun:' + stunServer}] // // stun server info
  })

  // generic handler that sends any ice candidates to the other peer
  peerConnection.onIceCandidate = iceEvent => {
    if (iceEvent.candidate) {
      signalingServer.send(JSON.stringify({
        type: 'new_ice_candidate',
        candidate: iceEvent.candidate
      }))
    }
  }

  // display remote video streams when they arrive
  peerConnection.onaddstream = event => {
    connectStreamToSrc(event.stream, remoteVideo)
    loadingState.style.display = 'none'
    remoteVideo.style.display = 'block'
  }

  setupVideo()

  if (document.location.hash === '' || document.location.hash === undefined) {
    // create the unique token for this call
    let token = Date.now() + '-' + Math.round(Math.random() * 10000)
    callToken = '#' + token
    document.location.hash = callToken

    signalingServer.onopen = () => {
      // setup caller signal handler
      signalingServer.onmessage = callerSignalHandler

      // tell the signaling server you have joined the call
      signalingServer.send(
        JSON.stringify({
          token: callToken,
          type: 'join'
        })
      )
    }
    document.title = 'You are the Caller'
    loadingState.innerHTML = 'Ready for a call...ask your friend to visit:<br/><br/>' + document.location
  } else { // you have a hash fragment so you must be the Callee
    // get the unique token for this call from location.hash
    callToken = document.location.hash

    signalingServer.onopen = () => {
      // setup callee signal handler
      signalingServer.onmessage = calleeSignalHandler

      // tell the signaling server you have joined the call
      signalingServer.send(
        JSON.stringify({
          token: callToken,
          type: 'join'
        })
      )
    }
  }

  // setup generic connection to the signaling server using the WebSocket API
  signalingServer = new Websocket('ws://localhost:3000')
}

// handle signals as a caller
const callerSignalHandler = event => {
  const signal = JSON.parse(event.data)

  if (signal.type === 'callee_arrived') {
    peerConnection.createOffer(
      newDescriptionCreated,
      logError
    )
  } else if (signal.type === 'new_ice_candidate') {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate))
  } else if (signal.type === 'new_description') {
    peerConnection.setRemoteDescription(new rtcSessionDescription(signal.sdp),
                                        () => {
                                          if (peerConnection.remoteDescription.type === 'answer') {
                                            // extend with your own custom answer handling here
                                          }
                                        },
                                        logError)
  } else {
    // extend with your own signal types here
  }
}

// handle signals as a callee
const calleeSignalHandler = event => {
  const signal = JSON.parse(event.data)
  if (signal.type === 'new_ice_candidate') {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate))
  } else if (signal.type === 'new_description') {
    peerConnection.setRemoteDescription(new rtcSessionDescription(signal.sdp),
                                        () => {
                                          if (peerConnection.remoteDescription.type === 'offer') {
                                            peerConnection.createAnswer(newDescriptionCreated, logError)
                                          }
                                        },
                                        logError)
  } else {
    // extend with your own signal types here
  }
}

// handler to process new descriptions
const newDescriptionCreated = description => {
  peerConnection.setLocalDescription(
    description,
    () => {
      signalingServer.send(
        JSON.stringify({
          token: callToken,
          type: 'new_description',
          sdp: description
        })
      )
    },
    logError
  )
}

const setupVideo = () => {
  const constraints = {
    audio: true,
    video: true
  }
  get_user_media(constraints, successCB, logError)
}

const successCB = localStream => {
  connectStreamToSrc(localStream, localVideo)
  peerConnection.addStream(localStream)
}

const logError = error => console.log(error)
