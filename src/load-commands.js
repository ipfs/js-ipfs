'use strict'

function requireCommands () {
  return {
    add: require('./api/add'),
    block: require('./api/block'),
    cat: require('./api/cat'),
    commands: require('./api/commands'),
    config: require('./api/config'),
    dht: require('./api/dht'),
    diag: require('./api/diag'),
    id: require('./api/id'),
    files: require('./api/files'),
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
}

function loadCommands (send) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach(file => {
    cmds[file] = files[file](send)
  })

  return cmds
}

module.exports = loadCommands
