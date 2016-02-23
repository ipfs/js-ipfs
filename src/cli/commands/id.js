const Command = require('ronin').Command
const IPFS = require('../../ipfs-core')
const debug = require('debug')
const utils = require('../utils')
const log = debug('cli')
log.error = debug('cli:error')

module.exports = Command.extend({
  desc: 'Shows IPFS Node ID info',

  options: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  run: (name) => {
    if (utils.isDaemonOn()) {
      const ctl = utils.getAPICtl()
      ctl.id((err, result) => {
        if (err) {
          return log.error(err)
        }
        console.log(result)
      })
    } else {
      const node = new IPFS()
      node.id((err, id) => {
        if (err) {
          return log.error(err)
        }
        console.log(id)
      })
    }
  }
})
