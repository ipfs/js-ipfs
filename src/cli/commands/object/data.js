const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Outputs the raw bytes in an IPFS object',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      const mh = utils.isDaemonOn()
        ? key
        : new Buffer(bs58.decode(key))

      ipfs.object.data(mh, (err, data) => {
        if (err) {
          log.error(err)
          throw err
        }

        if (data instanceof Buffer) {
          console.log(data.toString())
          return
        }

        // js-ipfs-api output (http stream)
        data.pipe(process.stdout)
      })
    })
  }
})
