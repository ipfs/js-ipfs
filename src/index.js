'use strict'
/* global self */

const isIPFS = require('is-ipfs')
const { Buffer } = require('buffer')
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

function ipfsClient (hostOrMultiaddr, port, userOptions) {
  // convert all three params to objects that we can merge.
  let options = {}

  if (!hostOrMultiaddr) {
    // autoconfigure host and port in browser
    if (typeof self !== 'undefined') {
      options = urlToOptions(self.location)
    }
  } else if (multiaddr.isMultiaddr(hostOrMultiaddr)) {
    options = maToOptions(hostOrMultiaddr)
  } else if (typeof hostOrMultiaddr === 'object') {
    options = hostOrMultiaddr
  } else if (typeof hostOrMultiaddr === 'string') {
    if (hostOrMultiaddr[0] === '/') {
      // throws if multiaddr is malformed or can't be converted to a nodeAddress
      options = maToOptions(multiaddr(hostOrMultiaddr))
    } else {
      // hostOrMultiaddr is domain or ip address as a string
      options.host = hostOrMultiaddr
    }
  }

  if (port && typeof port !== 'object') {
    port = { port: port }
  }

  const config = Object.assign(getConfig(), options, port, userOptions)
  const requestAPI = sendRequest(config)
  const cmds = loadCommands(requestAPI, config)
  cmds.send = requestAPI

  return cmds
}

function maToOptions (multiaddr) {
  // ma.nodeAddress() throws if multiaddr can't be converted to a nodeAddress
  const nodeAddr = multiaddr.nodeAddress()
  const protos = multiaddr.protos()
  // only http and https are allowed as protocol,
  // anything else will be replaced with http
  const exitProtocol = protos[protos.length - 1].name
  return {
    host: nodeAddr.address,
    port: nodeAddr.port,
    protocol: exitProtocol.startsWith('http') ? exitProtocol : 'http'
  }
}

function urlToOptions (url) {
  return {
    host: url.hostname,
    port: url.port || (url.protocol.startsWith('https') ? 443 : 80),
    protocol: url.protocol.startsWith('http') ? url.protocol.split(':')[0] : 'http'
  }
}

module.exports = ipfsClient

Object.assign(module.exports, { isIPFS, Buffer, CID, multiaddr, multibase, multicodec, multihash, PeerId, PeerInfo })
