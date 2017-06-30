window.onload = () => {
  const video = document.getElementById('video')
  const localURL = URL || window.webkitURL

  navigator.getMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia

  // Constraints
  const constraints = {
    video: true,
    audio: true
  }

  const successCB = localMediaStream => {
    window.stream = localMediaStream
    video.src = localURL.createObjectURL(localMediaStream)
  }

  const errorCB = error => {
    console.log('navigator.getUserMedia error: ', error)
  }

  // Capture video
  navigator.getMedia(constraints, successCB, errorCB)
}
