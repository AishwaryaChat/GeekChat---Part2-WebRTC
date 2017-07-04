let selectedUser = ''

window.onload = () => {
  const socket = io.connect()
  const userArea = document.getElementById('userArea')
  const messageArea = document.getElementById('messageArea')
  const submitUser = document.getElementById('submitUser')
  const userName = document.getElementById('userName')
  const usersList = document.getElementById('users')
  const chat = document.getElementById('chat')

  submitUser.onclick = e => {
    e.preventDefault()
    socket.emit('new user', userName.value, data => {
      if (data) {
        userArea.style.display = 'none'
        messageArea.style.display = 'block'
        const user = document.getElementById('user')
        user.innerHTML = userName.value
        userName.value = ''
      }
    })
  }

  socket.on('get users', users => {
    usersList.innerHTML = ''
    users.map(user => {
      const userName = document.createElement('li')
      userName.innerHTML = `<span>${user.name}</span>`
      userName.id = user.name
      userName.classname = 'list-group-item'
      usersList.appendChild(userName)
      userName.onclick = e => {
        e.preventDefault()
        selectedUser = userName.id
        chat.style.display = 'block'
      }
    })
  })
}
