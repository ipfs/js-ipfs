'use strict'

const Room = require('ipfs-pubsub-room')
const $message = document.querySelector('#message')
const $msgs = document.querySelector('#msgs')
const $addrs = document.querySelector('#addrs')
const $peers = document.querySelector('#peers')

const NAMESPACE = `ipfs-quick-msg`

const mkRoomName = (name) => {
  return `${NAMESPACE}-${name}`
}

module.exports = (ipfs, peersSet) => {
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
    $peers.innerHTML = tags
  }

  const updateAddrs = (addrs) => {
    $addrs.innerHTML = `
        <div>
            <ul>
                ${addrs.map((addr) => `<li>${addr.toString()}</li>`)}
            <ul>
        </div>`
  }

  return {
    createRoom,
    sendMsg,
    updatePeers,
    updateAddrs
  }
}
