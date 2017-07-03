const webrtcCapable = true
let rtcPeerConnection = null
let rtcSessionDescription = null
let get_user_media = null
let connectStreamToSrc = null
let stunServer = 'stun.l.google.com:19302'

if (navigator.getUserMedia) {
  rtcPeerConnection = RTCPeerConnection
  rtcSessionDescription = RTCSessionDescription
  get_user_media = navigator.getUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.srcObject = mediaStream
    mediaElement.play()
  }
} else if (navigator.mozGetUserMedia) {
  rtcPeerConnection = mozRTCPeerConnection
  rtcSessionDescription = mozRTCSessionDescription
  get_user_media = navigator.mozGetUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.mozSrcObject = mediaStream
    mediaElement.play()
  }
  stun_server = '74.125.31.127:19302'
} else if (navigator.webkitGetUserMedia) {
  rtcPeerConnection = webkitRTCPeerConnection
  rtcSessionDescription = RTCSessionDescription
  get_user_media = navigator.webkitGetUserMedia.bind(navigator)
  connectStreamToSrc = (mediaStream, mediaElement) => {
    mediaElement.src = webkitURl.createObjectURL(mediaStream)
  }
} else {
  alert("This browser does not support WebRTC - visit WebRTC.org for more info")
  webrtc_capable = false
}
