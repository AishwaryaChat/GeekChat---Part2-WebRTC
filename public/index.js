let localStream = {}
let localPeerConnection = {}
let remotePeerConnection = {}

const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')

const startButton = document.getElementById('startButton')
const callButton = document.getElementById('callButton')
const hangupButton = document.getElementById('hangupButton')

const trace = text => {
  console.log((performance.now() / 1000).toFixed(3) + ': ' + text)
}

startButton.onclick = () => {
  trace('Requesting local stream')
  navigator.getUserMedia({audio: true, video: true},
                          gotStream,
                          error => {
                            trace('getUserMedia error: ', error)
                          })
}

const gotStream = stream => {
  trace('Received local stream')
  localVideo.src = URL.createObjectURL(stream)
  localStream = stream
}

callButton.onclick = () => {
  trace('Starting call')
  const servers = null

  localPeerConnection = new RTCPeerConnection(servers)
  trace('Created local peer connection object localPeerConnection')
  localPeerConnection.onicecandidate = gotLocalIceCandidate

  remotePeerConnection = new RTCPeerConnection(servers)
  trace('Created remote peer connection object remotePeerConnection')
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate
  remotePeerConnection.onaddstream = gotRemoteStream

  localPeerConnection.addStream(localStream)
  trace('Added localStream to localPeerConnection')
  localPeerConnection.createOffer(gotLocalDescription,handleError)
}

const gotLocalIceCandidate = event => {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
    trace('Local ICE candidate: \n' + event.candidate.candidate)
  }
}

const gotRemoteIceCandidate = event => {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
    trace('Remote ICE candidate: \n ' + event.candidate.candidate)
  }
}

const gotRemoteStream = event => {
  remoteVideo.src = URL.createObjectURL(event.stream)
  trace('Received remote stream')
}

const gotLocalDescription = description => {
  localPeerConnection.setLocalDescription(description)
  trace('Offer from localPeerConnection: \n' + description.sdp)
  remotePeerConnection.setRemoteDescription(description)
  remotePeerConnection.createAnswer(gotRemoteDescription, handleError)
}

const gotRemoteDescription = description => {
  remotePeerConnection.setLocalDescription(description)
  trace('Answer from remotePeerConnection: \n' + description.sdp)
  localPeerConnection.setRemoteDescription(description)
}

hangupButton.onclick = () => {
  trace('Ending call')
  localPeerConnection.close()
  remotePeerConnection.close()
  localPeerConnection = null
  remotePeerConnection = null
}

const handleError = () => {}
