const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Get and serialize the DAG node named by <key>',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      if (utils.isDaemonOn()) {
        return ipfs.object.get(key, (err, obj) => {
          if (err) {
            log.error(err)
            throw err
          }

          console.log(JSON.stringify(obj))
        })
      }

      const mh = new Buffer(bs58.decode(key))
      ipfs.object.get(mh, (err, obj) => {
        if (err) {
          log.error(err)
          throw err
        }

        console.log(JSON.stringify({
          Links: obj.links.map((link) => ({
            Name: link.name,
            Hash: bs58.encode(link.hash).toString(),
            Size: link.size
          })),
          Data: obj.data.toString()
        }))
      })
    })
  }
})
