'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.links(argv.key, {enc: 'base58'}, (err, links) => {
        if (err) {
          throw err
        }

        links.forEach((link) => {
          link = link.toJSON()
          console.log(link.Hash, link.Size, link.Name)
        })
      })
    })
  }
}
