'use strict'

function requireCommands () {
  var cmds = {
    bitswap: require('./api/bitswap'),
    block: require('./api/block'),
    cat: require('./api/cat'),
    commands: require('./api/commands'),
    config: require('./api/config'),
    dht: require('./api/dht'),
    diag: require('./api/diag'),
    id: require('./api/id'),
    log: require('./api/log'),
    ls: require('./api/ls'),
    mount: require('./api/mount'),
    name: require('./api/name'),
    object: require('./api/object'),
    pin: require('./api/pin'),
    ping: require('./api/ping'),
    refs: require('./api/refs'),
    swarm: require('./api/swarm'),
    update: require('./api/update'),
    version: require('./api/version')
  }

  // TODO: crowding the 'files' namespace temporarily for interface-ipfs-core
  // compatibility, until 'files vs mfs' naming decision is resolved.
  cmds.files = function (send) {
    var files = require('./api/files')(send)
    files.add = require('./api/add')(send)
    return files
  }

  cmds.util = function (send) {
    var util = {
      addFiles: require('./api/add-files')(send),
      addUrl: require('./api/add-url')(send)
    }
    return util
  }

  return cmds
}

function loadCommands (send) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach((file) => {
    cmds[file] = files[file](send)
  })

  return cmds
}

module.exports = loadCommands
