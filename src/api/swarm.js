'use strict'

const cmds = require('../cmd-helpers')

module.exports = (send) => {
  return {
    peers: cmds.command(send, 'swarm/peers'),
    connect: cmds.argCommand(send, 'swarm/connect'),
    disconnect: cmds.argCommand(send, 'swarm/disconnect'),
    addrs: cmds.command(send, 'swarm/addrs'),
    localAddrs: cmds.command(send, 'swarm/addrs/local')
  }
}
