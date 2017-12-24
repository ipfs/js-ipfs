'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {},

  handler (argv) {
    argv.ipfs.key.list((err, res) => {
      if (err) {
        throw err
      }
      res.Keys.forEach((ki) => print(`${ki.Id} ${ki.Name}`))
    })
  }
}
