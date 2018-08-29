'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const CID = require('cids')
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    argv.ipfs.object.patch.rmLink(argv.root, { name: argv.link }, {
      enc: 'base58'
    }, (err, node) => {
      if (err) {
        throw err
      }

      print(cidToString(new CID(node.multihash), argv.cidBase))
    })
  }
}
