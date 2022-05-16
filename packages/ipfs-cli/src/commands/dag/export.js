import parseDuration from 'parse-duration'
import { CID } from 'multiformats/cid'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.rootcid
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'export <root cid>',

  describe: 'Streams the DAG beginning at the given root CID as a CAR stream on stdout',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, rootcid, timeout }) {
    const options = { timeout }
    const cid = CID.parse(rootcid)

    const exporter = ipfs.dag.export(cid, options)
    for await (const chunk of exporter) {
      print.write(chunk)
    }
  }
}

export default command
