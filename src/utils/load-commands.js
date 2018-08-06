'use strict'

function requireCommands () {
  const cmds = {
    // Files (not MFS)
    add: require('../files/add'),
    addReadableStream: require('../files/add-readable-stream'),
    addPullStream: require('../files/add-pull-stream'),
    cat: require('../files/cat'),
    catReadableStream: require('../files/cat-readable-stream'),
    catPullStream: require('../files/cat-pull-stream'),
    get: require('../files/get'),
    getReadableStream: require('../files/get-readable-stream'),
    getPullStream: require('../files/get-pull-stream'),
    ls: require('../ls'),
    lsReadableStream: require('../ls-readable-stream'),
    lsPullStream: require('../ls-pull-stream'),

    bitswap: require('../bitswap'),
    block: require('../block'),
    bootstrap: require('../bootstrap'),
    commands: require('../commands'),
    config: require('../config'),
    dag: require('../dag'),
    dht: require('../dht'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    mount: require('../mount'),
    name: require('../name'),
    object: require('../object'),
    pin: require('../pin'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    refs: require('../refs'),
    repo: require('../repo'),
    stop: require('../stop'),
    stats: require('../stats'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    update: require('../update'),
    version: require('../version'),
    types: require('../types'),
    resolve: require('../resolve'),
    dns: require('../dns')
  }

  // shutdown is an alias for stop
  cmds.shutdown = cmds.stop

  // TODO: crowding the 'files' namespace temporarily for interface-ipfs-core
  // compatibility, until 'files vs mfs' naming decision is resolved.
  cmds.files = function (send) {
    const files = require('../files')(send)

    return files
  }

  cmds.util = function (send, config) {
    const util = {
      addFromFs: require('../util/fs-add')(send),
      addFromStream: require('../files/add')(send),
      addFromURL: require('../util/url-add')(send),
      getEndpointConfig: require('../util/get-endpoint-config')(config),
      crypto: require('libp2p-crypto'),
      isIPFS: require('is-ipfs')
    }
    return util
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
