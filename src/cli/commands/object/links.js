const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Outputs the links pointed to by the specified object',

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

      ipfs.object.links(mh, (err, links) => {
        if (err) {
          log.error(err)
          throw err
        }

        if (links.Links) { // js-ipfs-api output
          links.Links.forEach((link) => {
            console.log(link.Hash, link.Size, link.Name)
          })
          return
        }

        links.forEach((link) => {
          console.log(bs58.encode(link.hash).toString(), link.size, link.name)
        })
      })
    })
  }
})
