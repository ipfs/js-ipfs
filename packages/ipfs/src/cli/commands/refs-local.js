'use strict'

const parseDuration = require('parse-duration')
const multibase = require('multibase')

module.exports = {
  command: 'refs-local',

  describe: 'List all local references.',

  epilog: 'CIDs are reconstructed therefore they might differ from those under which the blocks were originally stored.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    },
    multihash: {
      type: 'boolean',
      default: false,
      desc: 'Shows base32 encoded multihashes instead of reconstructed CIDs'
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout, cidBase, multihash }) {
    for await (const { ref, err } of ipfs.refs.local({
      timeout
    })) {
      if (err) {
        print(err, true, true)
      } else {
        if (multihash) {
          print(multibase.encode('base32', Buffer.from(ref)).toString().substring(1).toUpperCase())
        } else {
          print(ref)
        }
      }
    }
  }
}
