import parseDuration from 'parse-duration'

export default {
  command: 'wantlist [peer]',

  describe: 'Print out all blocks currently on the bitswap wantlist for the local peer.',

  builder: {
    peer: {
      alias: 'p',
      describe: 'Specify which peer to show wantlist for.',
      type: 'string'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.peer
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, peer, cidBase, timeout }) {
    const { ipfs, print } = ctx
    const base = await ipfs.bases.getBase(cidBase)

    /** @type {import('multiformats/cid').CID[]} */
    let list

    if (peer) {
      list = await ipfs.bitswap.wantlistForPeer(peer, {
        timeout
      })
    } else {
      list = await ipfs.bitswap.wantlist({
        timeout
      })
    }

    list.forEach(cid => print(cid.toString(base.encoder)))
  }
}
