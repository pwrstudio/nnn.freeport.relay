const PORT = process.env.PORT || 9090
const server = require('http').createServer()
const io = require('socket.io')(server)
var geoip = require('geoip-lite')
server.listen(PORT)

let allClients = []

console.log('starting.....')

io.sockets.on('connection', socket => {
  // ENTER
  console.log('connection')
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

  let user = {
    ip: clientIp,
    id: socket.id,
    geo: clientGeo,
    time: new Date()
  }

  allClients.push(user)
  io.emit('enter', {user: user, list: allClients})
  // END: ENTER

  // DISCONNECT
  socket.on('disconnect', () => {
    let removedUser = allClients.find(c => c.id === socket.id)
    allClients = allClients.filter(c => c.id !== socket.id)
    io.emit('leave', {user: removedUser, list: allClients})
  })
  // END: DISCONNECT

  // VIEW
  socket.on('view', data => {
    io.emit('view', data)
  })
  // END: VIEW
})
