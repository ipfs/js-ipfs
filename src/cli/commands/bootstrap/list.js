'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  handler () {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.bootstrap.list((err, list) => {
        if (err) {
          throw err
        }
        list.forEach((node) => {
          console.log(node)
        })
      })
    })
  }
}
