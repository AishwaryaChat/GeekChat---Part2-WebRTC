const express = require('express')
const app = express()
const path = require('path')

app.listen(3000, () => {
  console.log('listening on port 3000')
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})
