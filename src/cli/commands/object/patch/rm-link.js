'use strict'

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
    }, (err, cid) => {
      if (err) {
        throw err
      }

      print(cidToString(cid, argv.cidBase))
    })
  }
}
