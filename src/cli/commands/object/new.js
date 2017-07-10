'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'new [<template>]',

  describe: 'Create new ipfs objects',

  builder: {},

  handler (argv) {
    argv.ipfs.object.new(argv.template, (err, node) => {
      if (err) {
        throw err
      }

      const nodeJSON = node.toJSON()

      console.log(nodeJSON.multihash)
    })
  }
}
