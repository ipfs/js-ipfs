import parseDuration from 'parse-duration'
import { CID } from 'multiformats/cid'

export default {
  command: 'export <root cid>',

  describe: 'Streams the DAG beginning at the given root CID as a CAR stream on stdout.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.rootcid
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, rootcid, timeout }) {
    const options = { timeout }
    const cid = CID.parse(rootcid)

    const exporter = ipfs.dag.export(cid, options)
    for await (const chunk of exporter) {
      print.write(chunk)
    }
  }
}
