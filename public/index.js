window.onload = () => {
  let video = document.getElementById('video')
  const vendorURL = URL || window.webkitURL

  navigator.getMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia

  // Capture video
  navigator.getMedia({
    video: true,
    audio: false
  },
  stream => {
    console.log(stream)
    video.src = vendorURL.createObjectURL(stream)
  },
  err => console.log(err))
}
