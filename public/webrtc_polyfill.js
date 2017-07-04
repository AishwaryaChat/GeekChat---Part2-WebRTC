const webrtcCapable = true
let rtcPeerConnection = null
let rtcSessionDescription = null
let getUserMedia = null
let connectStreamToSrc = null
let stunServer = 'stun.l.google.com:19302'

if (navigator.getUserMedia) {
  RTCPeerConnection = RTCPeerConnection
  RTCSessionDescription = RTCSessionDescription
  getUserMedia = navigator.getUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.srcObject = mediaStream
    mediaElement.play()
  }
} else if (navigator.mozGetUserMedia) {
  RTCPeerConnection = mozRTCPeerConnection
  RTCSessionDescription = mozRTCSessionDescription
  getUserMedia = navigator.mozGetUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.mozSrcObject = mediaStream
    mediaElement.play()
  }
  stun_server = '74.125.31.127:19302'
} else if (navigator.webkitGetUserMedia) {
  RTCPeerConnection = webkitRTCPeerConnection
  RTCSessionDescription = RTCSessionDescription
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.src = webkitURl.createObjectURL(mediaStream)
  }
} else {
  alert("This browser does not support WebRTC - visit WebRTC.org for more info")
  webrtc_capable = false
}
