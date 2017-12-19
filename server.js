const PORT = process.env.PORT || 9090
const server = require('http').createServer()
const io = require('socket.io')(server)
var geoip = require('geoip-lite')
server.listen(PORT)

let allClients = []

io.sockets.on('connection', socket => {
  // TODO: validate client ip
  let clientIp = socket.handshake.headers['x-forwarded-for']
  let clientGeo = geoip.lookup(clientIp)

  if (!clientGeo) {
    clientGeo = {
      range: null,
      country: null,
      region: null,
      city: null,
      ll: null,
      metro: null,
      zip: null
    }
  }

  console.log(clientGeo)

  let user = {
    ip: clientIp,
    id: socket.id,
    geo: clientGeo,
    time: new Date()
  }

  allClients.push(user)

  io.emit('enter', {user: user, list: allClients})

  socket.on('disconnect', () => {
    let i = allClients.indexOf(socket.id)
    allClients.splice(i, 1)
    io.emit('leave', {user: socket.handshake.headers['x-forwarded-for'], list: allClients})
  })

  socket.on('view', data => {
    io.emit('view', data)
  })
})
