'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../utils').print
const {
  util: {
    cid
  }
} = require('ipld-dag-pb')

module.exports = {
  command: 'new [<template>]',

  describe: 'Create new ipfs objects',

  builder: {
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    argv.ipfs.object.new(argv.template, (err, node) => {
      if (err) {
        throw err
      }

      cid(node, (err, cid) => {
        if (err) {
          throw err
        }

        print(cid.toBaseEncodedString(argv.cidBase))
      })
    })
  }
}
