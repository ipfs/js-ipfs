'use strict'

const IPFS = require('ipfs')
const Helpers = require('./helpers')

const $peerId = document.querySelector('#peer-id')
const $message = document.querySelector('#message')
const $msgs = document.querySelector('#msgs')
const $send = document.querySelector('#send')
const $peer = document.querySelector('#peer')
const $connect = document.querySelector('#connect')
const $pAddrs = document.querySelector('#peers-addrs')
const $room = document.querySelector('#room')
const $roomId = document.querySelector('#room-id')

let roomName = `default`
const fragment = window.location.hash.substr(1)
if (fragment) {
  roomName = fragment
}

$pAddrs.value = ''
$room.innerText = roomName

const repo = () => {
  return 'ipfs/pubsub-demo/' + Math.random()
}

const ipfs = new IPFS({
  repo: repo(),
  relay: {
    enabled: true, // enable relay dialer/listener (STOP)
    hop: {
      enabled: true // make this node a relay (HOP)
    }
  },
  EXPERIMENTAL: {
    pubsub: true // enable pubsub
  },
  config: {
    Bootstrap: []
  }
})

const peersSet = new Set()
const helpers = Helpers(ipfs, peersSet)
const createRoom = helpers.createRoom
const sendMsg = helpers.sendMsg
const updatePeers = helpers.updatePeers
const updateAddrs = helpers.updateAddrs

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with id ' + info.id)

  let room = createRoom(roomName)

  $peerId.innerHTML = `<li>${info.id}</li>`
  updateAddrs(info.addresses)

  $send.addEventListener('click', () => {
    sendMsg(room)
  })

  $room.addEventListener('dblclick', () => {
    $room.setAttribute('style', 'display: none')
    $roomId.setAttribute('style', 'display: inline')
  })

  $roomId.addEventListener('keyup', (event) => {
    const kp = event.keyCode || event.which
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
      updatePeers(peersSet)
    } else if (kp === 27) {
      $roomId.value = ''
      $room.setAttribute('style', 'display: inline')
      $roomId.setAttribute('style', 'display: none')
    }
  })

  $message.addEventListener('keyup', (event) => {
    const kp = event.keyCode || event.which
    if (kp === 13) {
      sendMsg(room)
    }
  })

  $connect.addEventListener('click', () => {
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
