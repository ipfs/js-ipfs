const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

const $peerId = document.querySelector('#peer-id')
const $message = document.querySelector('#message')
const $msgs = document.querySelector('#msgs')
const $peers = document.querySelector('#peers')
const $send = document.querySelector('#send')
const $peer = document.querySelector('#peer')
const $connect = document.querySelector('#connect')
const $pAddrs = document.querySelector('#peers-addrs')
const $addrs = document.querySelector('#addrs')
const $room = document.querySelector('#room')
const $roomId = document.querySelector('#room-id')

const NAMESPACE = `ipfs-quick-msg`

$pAddrs.value = ''
const peersSet = new Set()

const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    EXPERIMENTAL: {
      relay: {
        enabled: true,
        hop: {
          enabled: true
        }
      }
    },
    Bootstrap: []
  }
})

let roomName = `default`
const mkRoomName = (name) => {
  return `${NAMESPACE}-${name}`
}

const fragment = window.location.hash.substr(1)
let room
if (fragment) {
  roomName = fragment
}

$room.innerText = roomName

const createRoom = (name) => {
  const room = Room(ipfs, mkRoomName(name))

  room.on('peer joined', (peer) => {
    console.log('peer ' + peer + ' joined')
    peersSet.add(peer)
    updatePeers()
  })

  room.on('peer left', (peer) => {
    console.log('peer ' + peer + ' left')
    peersSet.delete(peer)
    updatePeers()
  })

  // send and receive messages
  room.on('message', (message) => {
    console.log('got message from ' + message.from + ': ' + message.data.toString())
    const node = document.createElement(`li`)
    node.classList = ``.split(' ')
    node.innerText = `${message.from.substr(-4)}: ${message.data.toString()}`
    $msgs.appendChild(node)
  })

  return room
}

const sendMsg = (room) => {
  const msg = $message.value
  $message.value = ''
  room.broadcast(msg)
  $message.focus()
}

const updatePeers = () => {
  const tags = Array.from(peersSet).map((p) => {
    return `<li>${p}</li>`
  })
  $peers.innerHTML = tags
}

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with id ' + info.id)

  let room = createRoom(roomName)

  $peerId.innerHTML = `<li>${info.id}</li>`
  $addrs.innerHTML += `
  <div>
    <ul>
    ${
      info
      .addresses
      .map((addr) => `<li>${addr.toString()}</li>`)
    }
    <ul>
  </div>`

  $send.addEventListener('click', (event) => {
    sendMsg(room)
  })

  $room.addEventListener('dblclick', (event) => {
    $room.setAttribute('style', 'display: none')
    $roomId.setAttribute('style', 'display: inline')
  })

  $roomId.addEventListener('keyup', (event) => {
    var kp = event.keyCode || event.which
    if (kp === 13 && $roomId.value.length > 0) {
      let name = $roomId.value
      $room.innerText = name

      $room.setAttribute('style', 'display: inline')
      $roomId.setAttribute('style', 'display: none')

      $roomId.value = ''
      $msgs.innerHTML = ''
      window.location.hash = name
      room = createRoom(name)
      peersSet.clear()
      updatePeers()
    }
  })

  $message.addEventListener('keyup', (event) => {
    var kp = event.keyCode || event.which
    if (kp === 13) {
      sendMsg(room)
    }
  })

  $connect.addEventListener('click', (event) => {
    const peer = $peer.value
    $peer.value = ''
    ipfs.swarm.connect(peer, (err) => {
      if (err) {
        return console.error(err)
      }
      $pAddrs.innerHTML += `<li>${peer.trim()}</li>`
    })
  })
}))

function repo () {
  return 'ipfs/pubsub-demo/' + Math.random()
}
