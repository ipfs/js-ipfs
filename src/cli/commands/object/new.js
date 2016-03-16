const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Create new ipfs objects',

  options: {},

  run: (template) => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.object.new(template, (err, obj) => {
        if (err) {
          log.error(err)
          throw err
        }

        if (typeof obj.Hash === 'string') { // js-ipfs-api output
          console.log(obj.Hash)
          return
        }

        console.log(bs58.encode(obj.Hash).toString())
      })
    })
  }
})
