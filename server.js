const path = require('path')
const https = require('https')
const express = require('express')
const fs = require('fs')
const PeerServer = require('peer').PeerServer

const optionsHttps = {
  key: fs.readFileSync('/mykey.pem'),
  cert: fs.readFileSync('/my-cert.pem')
}

const app = express()
const httpsServer = https.createServer(optionsHttps, app)
PeerServer({port: process.env.PORT || 8000,
  key: 'peerjs'})

const io = require('socket.io')(httpsServer)

app.use(express.static(path.join(__dirname, 'public')))

httpsServer.listen(3000, (req, res) => {
  console.log('listening on port 3000')
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

const users = []
const connections = []

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
  socket.on('new user', (obj, cb) => {
    console.log('new user', obj)
    let fusers = users.filter(user => user.name === obj.name)
    if (fusers[0]) {
      cb(false)
    } else {
      cb(true)
      socket.username = obj.name
      users.push({
        id: socket.id,
        name: socket.username,
        peerID: obj.peerID
      })
      updateUsernames()
    }
  })

  const updateUsernames = () => {
    let i = 0
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

// const express = require('express')
// const app = express()
// const fs = require('fs')
// const https = require('https')
// const server = require('http').createServer(app)
// const path = require('path')
// const ExpressPeerServer = require('peer').ExpressPeerServer
// const io = require('socket.io').listen(server)
//
// const credentials = {
//   key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
//   cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
// }
//
// const httpsServer = https.createServer(credentials, app).listen(3000, (req, res) => {
// 	console.log('listening on 3000')
// })
//
// const options = {
//     debug: true
// }
//
// const peerServer = ExpressPeerServer(httpsServer, options)
// app.use('/peerjs', peerServer)

// const express = require('express')
// const app = express()
// const path = require('path')
// const fs = require('fs')
// const http = require('http')
// const https = require('https')
// const httpServer = http.createServer(app)
// // const server = require('https').createServer(app)
// const ExpressPeerServer = require('peer').ExpressPeerServer
//
// const server = require('https')
//
// const options = {
// 	key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
//   cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
// }
//
// const httpsServer = https.createServer(options, app)
// const io = require('socket.io').listen(httpsServer)
//
// const PeerServer = require('peer').PeerServer
//
// const peerServer = PeerServer({
//   port: 9000,
//   ssl: {
//     key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
//     cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
//   }
// })
//
// app.use('/peerjs', ExpressPeerServer(httpsServer, {
// 	debug: true
// }))
//
// // app.use('/peerjs', ExpressPeerServer(peerServer, {
// // 	debug: true
// // }))
