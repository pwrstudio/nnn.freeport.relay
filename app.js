const express = require('express')
const app = express()
const port = 80
const server = app.listen(port)
const io = require('socket.io').listen(server)

let allClients = []

io.sockets.on('connection', socket => {
  allClients.push(socket.id)
  io.emit('enter', {user: socket.handshake.headers.origin, list: allClients})

  socket.on('disconnect', () => {
    let i = allClients.indexOf(socket.id)
    allClients.splice(i, 1)
    io.emit('leave', {user: socket.handshake.headers.origin, list: allClients})
  })

  socket.on('view', data => {
    console.log(data)
    io.emit('view', {})
  })
})
