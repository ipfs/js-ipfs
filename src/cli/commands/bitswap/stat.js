'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')
const { cidToString } = require('../../../utils/cid')
const { humanize } = require('../../utils')

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    },
    human: {
      describe: 'Print sizes in human readable format (e.g., 1K 234M 2G).',
      type: 'boolean',
      default: false
    }
  },

  handler ({ getIpfs, cidBase, resolve, human }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const stats = await ipfs.bitswap.stat()
      stats.wantlist = stats.wantlist.map(k => cidToString(k['/'], { base: cidBase, upgrade: false }))
      stats.peers = stats.peers || []
      if (human) {
        stats.dupDataReceived = humanize.Bytes(stats.dupDataReceived)
      }

      print(`bitswap status
  blocks received: ${stats.blocksReceived}
  dup blocks received: ${stats.dupBlksReceived}
  dup data received: ${stats.dupDataReceived}
  wantlist [${stats.wantlist.length} keys]
    ${stats.wantlist.join('\n    ')}
  partners [${stats.peers.length}]
    ${stats.peers.join('\n    ')}`)
    })())
  }
}
