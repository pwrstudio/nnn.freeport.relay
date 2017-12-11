const express = require('express')
const app = express()
const port = 80
const server = app.listen(port)
const io = require('socket.io').listen(server)

let allClients = []

io.sockets.on('connection', socket => {
  allClients.push(socket.id)
  io.emit('list', allClients)

  socket.on('disconnect', () => {
    let i = allClients.indexOf(socket.id)
    allClients.splice(i, 1)
    io.emit('list', allClients)
  })
})
