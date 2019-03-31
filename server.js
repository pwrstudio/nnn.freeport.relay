const PORT = process.env.PORT || 9090
const server = require('http').createServer()
const io = require('socket.io')(server)
const geoip = require('geoip-lite')

const Raven = require('raven')
Raven.config(
  'https://ead41eebe20c4a838fed8dbc0e6fb09f:e525dbf532884b54964840819bc3dce3@sentry.io/278971'
).install()

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

  // Add new client to top of array
  allClients.unshift(user)

  io.emit('enter', { user: user, list: allClients })
  // END: ENTER

  // DISCONNECT
  socket.on('disconnect', () => {
    let removedUser = allClients.find(c => c.id === socket.id)
    allClients = allClients.filter(c => c.id !== socket.id)
    io.emit('leave', { user: removedUser, list: allClients })
  })
  // END: DISCONNECT

  // VIEW
  socket.on('view', data => {
    io.emit('view', {
      hash: data.hash,
      title: data.title,
      id: socket.id
    })
  })
  // END: VIEW

  // CHAT
  socket.on('chat', data => {
    io.to(data.id).emit('chat', {
      msg: data.msg,
      id: socket.id
    })
  })
  // END: CHAT
})
