/* eslint-disable no-console */
'use strict'

const Room = require('ipfs-pubsub-room')
const $message = document.querySelector('#message')
const $msgs = document.querySelector('#msgs')
const $addrs = document.querySelector('#addrs')
const $peers = document.querySelector('#peers')
const $pAddrs = document.querySelector('#peers-addrs')
const delay = require('delay')

const NAMESPACE = 'ipfs-quick-msg'

const mkRoomName = (name) => {
  return `${NAMESPACE}-${name}`
}

module.exports = (ipfs, peersSet) => {
  const createRoom = (name) => {
    const room = new Room(ipfs, mkRoomName(name))

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
      const node = document.createElement('li')
      node.innerText = `${message.from.substr(-4)}: ${message.data.toString()}`
      $msgs.appendChild(node)
    })

    return room
  }

  const sendMsg = (room) => {
    const msg = $message.value
    if (msg.length > 0) {
      $message.value = ''
      room.broadcast(msg)
      $message.focus()
    }
  }

  const updatePeers = () => {
    const tags = Array.from(peersSet).map((p) => {
      return `<li>${p}</li>`
    })
    $peers.innerHTML = tags.join('')
  }

  const updateSwarmPeers = async (ipfs) => {
    const peers = await ipfs.swarm.peers()

    $pAddrs.innerHTML = peers.map(peer => `<li>${peer.peer}</li>`).join('')
  }

  const updateAddrs = async (ipfs) => {
    const info = await ipfs.id()
    const relayAddrs = []

    $addrs.innerHTML = relayAddrs.map((addr) => `<li>${addr.toString()}</li>`).join('')
  }

  return {
    createRoom,
    sendMsg,
    updatePeers,
    updateSwarmPeers,
    updateAddrs
  }
}
