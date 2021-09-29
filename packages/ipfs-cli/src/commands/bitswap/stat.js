import prettyBytes from 'pretty-bytes'
import parseDuration from 'parse-duration'

export default {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      default: 'base58btc'
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
   * @param {string} argv.cidBase
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
      output.blocksReceived = Number(stats.blocksReceived)
      output.blocksSent = Number(stats.blocksSent)
      output.dataReceived = prettyBytes(Number(stats.dataReceived)).toUpperCase()
      output.dataSent = prettyBytes(Number(stats.dataSent)).toUpperCase()
      output.dupBlksReceived = Number(stats.dupBlksReceived)
      output.dupDataReceived = prettyBytes(Number(stats.dupDataReceived)).toUpperCase()
      output.wantlist = `[${stats.wantlist.length} keys]`
    } else {
      const base = await ipfs.bases.getBase(cidBase)

      const wantlist = stats.wantlist.map(cid => cid.toString(base.encoder))
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
