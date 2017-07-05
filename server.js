const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

const users = []
const connections = []

server.listen(process.env.PORT || 3000, () => {
  console.log('server running')
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {

})

io.sockets.on('connection', socket => {
  connections.push(socket)
  console.log('sockets connected: ', connections.length)

  // Disconnect
  socket.on('disconnect', data => {
    let i = 0
    if (socket.username !== undefined) {
      users.map(user => {
        if (user.name === socket.username) {
          users.splice(i, 1)
        }
        i++
      })
      updateUsernames()
    }
    connections.splice(connections.indexOf(socket), 1)
    console.log('Disconnected: %s sockets connected', connections.length)
  })

  // New users
  socket.on('new user', (userName, cb) => {
    let fusers = users.filter(user => user.name === userName)
    if (fusers[0]) {
      cb(false)
    } else {
      cb(true)
      socket.username = userName
      users.push({
        id: socket.id,
        name: socket.username
      })
      updateUsernames()
    }
  })

  // video chat
  socket.on('message', msg => {
    console.log('usersssssss', users)
    console.log('msg-type', msg.type, msg.target)
    let targetID = ''
    users.map(user => {
      if (user.name !== msg.target) {
        targetID = user.id
      }
    })
    if (targetID !== '') {
      // console.log('userssssss', users)
      // console.log('targetID', targetID, 'msg-type', msg)
      io.sockets.in(targetID).emit('message', msg)
    }
  })

  const updateUsernames = () => {
    var i = 0
    for (; i < users.length; i++) {
      let onlineUserList = []
      users.map(user => {
        if (user.name !== users[i].name) {
          onlineUserList.push(user)
        }
      })
      io.sockets.in(users[i].id).emit('get users', onlineUserList)
    }
  }
})
