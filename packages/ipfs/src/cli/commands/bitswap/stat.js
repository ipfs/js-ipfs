'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const prettyBytes = require('pretty-bytes')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    human: {
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, cidBase, human, timeout }) {
    const { ipfs, print } = ctx

    const stats = await ipfs.bitswap.stat({
      timeout
    })

    if (human) {
      stats.blocksReceived = stats.blocksReceived.toNumber()
      stats.blocksSent = stats.blocksSent.toNumber()
      stats.dataReceived = prettyBytes(stats.dataReceived.toNumber()).toUpperCase()
      stats.dataSent = prettyBytes(stats.dataSent.toNumber()).toUpperCase()
      stats.dupBlksReceived = stats.dupBlksReceived.toNumber()
      stats.dupDataReceived = prettyBytes(stats.dupDataReceived.toNumber()).toUpperCase()
      stats.wantlist = `[${stats.wantlist.length} keys]`
    } else {
      const wantlist = stats.wantlist.map(cid => cidToString(cid, { base: cidBase, upgrade: false }))
      stats.wantlist = `[${wantlist.length} keys]
            ${wantlist.join('\n            ')}`
    }

    print(`bitswap status
        provides buffer: ${stats.provideBufLen}
        blocks received: ${stats.blocksReceived}
        blocks sent: ${stats.blocksSent}
        data received: ${stats.dataReceived}
        data sent: ${stats.dataSent}
        dup blocks received: ${stats.dupBlksReceived}
        dup data received: ${stats.dupDataReceived}
        wantlist ${stats.wantlist}
        partners [${stats.peers.length}]`)
  }
}
