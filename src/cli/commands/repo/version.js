'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')

module.exports = Command.extend({
  desc: 'Shows IPFS repo version information',

  options: {},

  run: function () {
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
})
