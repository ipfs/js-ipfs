const Command = require('ronin').Command
const IPFS = require('../../ipfs-core')
const debug = require('debug')
let log = debug('cli:id')
log.error = debug('cli:id:error')

module.exports = Command.extend({
  desc: 'Shows IPFS Node ID info',

  options: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  run: name => {
    let node = new IPFS()
    node.id((err, id) => {
      if (err) { return log.error(err) }
      console.log(id)
    })
  }
})
