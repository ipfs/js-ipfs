'use strict'

function requireCommands () {
  const cmds = {
    // Files Regular (not MFS)
    add: require('../files-regular/add'),
    addReadableStream: require('../files-regular/add-readable-stream'),
    addPullStream: require('../files-regular/add-pull-stream'),
    addFromFs: require('../files-regular/add-from-fs'),
    addFromURL: require('../files-regular/add-from-url'),
    addFromStream: require('../files-regular/add'),
    cat: require('../files-regular/cat'),
    catReadableStream: require('../files-regular/cat-readable-stream'),
    catPullStream: require('../files-regular/cat-pull-stream'),
    get: require('../files-regular/get'),
    getReadableStream: require('../files-regular/get-readable-stream'),
    getPullStream: require('../files-regular/get-pull-stream'),
    ls: require('../files-regular/ls'),
    lsReadableStream: require('../files-regular/ls-readable-stream'),
    lsPullStream: require('../files-regular/ls-pull-stream'),

    // Block
    block: require('../block'),
    bitswap: require('../bitswap'),

    // Graph
    dag: require('../dag'),
    object: require('../object'),
    pin: require('../pin'),

    // Network
    bootstrap: require('../bootstrap'),
    dht: require('../dht'),
    name: require('../name'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    dns: require('../dns'),

    // Miscellaneous
    commands: require('../commands'),
    config: require('../config'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    mount: require('../mount'),
    refs: require('../refs'),
    repo: require('../repo'),
    stop: require('../stop'),
    stats: require('../stats'),
    update: require('../update'),
    version: require('../version'),
    types: require('../types'),
    resolve: require('../resolve')
  }

  // shutdown is an alias for stop
  cmds.shutdown = cmds.stop

  // Files MFS (Mutable Filesystem)
  cmds.files = (send) => {
    return require('../files-mfs')(send)
  }

  cmds.util = (send, config) => {
    return {
      getEndpointConfig: require('../util/get-endpoint-config')(config),
      crypto: require('libp2p-crypto'),
      isIPFS: require('is-ipfs')
    }
  }

  return cmds
}

function loadCommands (send, config) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach((file) => {
    cmds[file] = files[file](send, config)
  })

  return cmds
}

module.exports = loadCommands
