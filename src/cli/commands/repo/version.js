'use strict'

const utils = require('../../utils')

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.repo.version(function (err, version) {
        if (err) {
          return console.error(err)
        }
        console.log(version)
      })
    })
  }
}
