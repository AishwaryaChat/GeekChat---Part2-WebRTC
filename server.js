const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

let webrtcClients = []
let webrtcDiscussions = {}

server.listen(process.env.PORT || 3000, () => {
  console.log('server running on port 3000')
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})
