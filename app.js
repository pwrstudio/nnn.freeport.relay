const PORT = process.env.PORT || 9090
const server = require('http').createServer()
const io = require('socket.io')(server)
var geoip = require('geoip-lite')
server.listen(PORT)

let allClients = []

io.sockets.on('connection', socket => {
  // TODO: validate client ip
  // console.log(socket.conn.request.headers.referer)
  // console.log(socket.handshake.headers.origin)
  // console.log(socket.handshake)
  // console.log(socket.handshake.headers['x-real-ip'])
  // console.log(socket.handshake.headers['x-forwarded-for'])
  // console.log(socket.request.socket.remoteAddress)

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
    geo: clientGeo
  }
  allClients.push(user)

  io.emit('enter', {user: user, list: allClients})

  socket.on('disconnect', () => {
    let i = allClients.indexOf(socket.id)
    allClients.splice(i, 1)
    io.emit('leave', {user: socket.handshake.headers['x-forwarded-for'], list: allClients})
  })

  socket.on('view', data => {
    console.log(data)
    io.emit('view', {})
  })
})
