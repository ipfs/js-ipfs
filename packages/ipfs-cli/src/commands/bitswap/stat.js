'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const prettyBytes = require('pretty-bytes')
const { default: parseDuration } = require('parse-duration')

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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {boolean} argv.human
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, cidBase, human, timeout }) {
    const { ipfs, print } = ctx

    const stats = await ipfs.bitswap.stat({
      timeout
    })

    /** @type {Record<string, any>} */
    const output = {
      ...stats
    }

    if (human) {
      output.blocksReceived = stats.blocksReceived.toNumber()
      output.blocksSent = stats.blocksSent.toNumber()
      output.dataReceived = prettyBytes(stats.dataReceived.toNumber()).toUpperCase()
      output.dataSent = prettyBytes(stats.dataSent.toNumber()).toUpperCase()
      output.dupBlksReceived = stats.dupBlksReceived.toNumber()
      output.dupDataReceived = prettyBytes(stats.dupDataReceived.toNumber()).toUpperCase()
      output.wantlist = `[${stats.wantlist.length} keys]`
    } else {
      const wantlist = stats.wantlist.map(cid => cidToString(cid, { base: cidBase, upgrade: false }))
      output.wantlist = `[${wantlist.length} keys]
            ${wantlist.join('\n            ')}`
    }

    print(`bitswap status
        provides buffer: ${output.provideBufLen}
        blocks received: ${output.blocksReceived}
        blocks sent: ${output.blocksSent}
        data received: ${output.dataReceived}
        data sent: ${output.dataSent}
        dup blocks received: ${output.dupBlksReceived}
        dup data received: ${output.dupDataReceived}
        wantlist ${output.wantlist}
        partners [${stats.peers.length}]`)
  }
}
