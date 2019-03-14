'use strict'
/* global self */

const isIPFS = require('is-ipfs')
const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const loadCommands = require('./utils/load-commands')
const getConfig = require('./utils/default-config')
const sendRequest = require('./utils/send-request')

function ipfsClient (hostOrMultiaddr, port, opts) {
  // convert all three params to objects that we can merge.
  let hostAndPort = {}

  if (!hostOrMultiaddr) {
    // autoconfigure host and port in browser
    if (typeof self !== 'undefined') {
      const split = self.location.host.split(':')
      hostAndPort.host = split[0]
      hostAndPort.port = split[1]
    }
  } else if (multiaddr.isMultiaddr(hostOrMultiaddr)) {
    hostAndPort = toHostAndPort(hostOrMultiaddr)
  } else if (typeof hostOrMultiaddr === 'object') {
    hostAndPort = hostOrMultiaddr
  } else if (typeof hostOrMultiaddr === 'string') {
    if (hostOrMultiaddr[0] === '/') {
      // throws if multiaddr is malformed or can't be converted to a nodeAddress
      hostAndPort = toHostAndPort(multiaddr(hostOrMultiaddr))
    } else {
      // hostOrMultiaddr is domain or ip address as a string
      hostAndPort.host = hostOrMultiaddr
    }
  }

  if (port && typeof port !== 'object') {
    port = { port: port }
  }

  const config = Object.assign(getConfig(), hostAndPort, port, opts)
  const requestAPI = sendRequest(config)
  const cmds = loadCommands(requestAPI, config)
  cmds.send = requestAPI

  return cmds
}

// throws if multiaddr can't be converted to a nodeAddress
function toHostAndPort (multiaddr) {
  const nodeAddr = multiaddr.nodeAddress()
  return {
    host: nodeAddr.address,
    port: nodeAddr.port
  }
}

module.exports = ipfsClient

Object.assign(module.exports, { isIPFS, Buffer, CID, multiaddr, multibase, multicodec, multihash, PeerId, PeerInfo })
