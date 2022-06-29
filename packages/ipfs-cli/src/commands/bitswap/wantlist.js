import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@libp2p/interface-peer-id').PeerId} Argv.peer
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'wantlist [peer]',

  describe: 'Print out all blocks currently on the bitswap wantlist for the local peer',

  builder: {
    peer: {
      alias: 'p',
      describe: 'Specify which peer to show wantlist for',
      string: true,
      coerce: coercePeerId
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
