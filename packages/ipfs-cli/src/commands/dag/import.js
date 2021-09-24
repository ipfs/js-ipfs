import fs from 'fs'
import parseDuration from 'parse-duration'

export default {
  command: 'import [path...]',

  describe: 'Import the contents of one or more CARs from files or stdin',

  builder: {
    'pin-roots': {
      type: 'boolean',
      default: true,
      describe: 'Pin optional roots listed in the CAR headers after importing.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
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
   * @param {string[]} argv.path
   * @param {boolean} argv.pinRoots
   * @param {number} argv.timeout
   * @param {string} argv.cidBase
   */
  async handler ({ ctx: { ipfs, print, getStdin }, path, pinRoots, timeout, cidBase }) {
    const handleResult = async (/** @type {import('ipfs-core-types/src/dag').ImportResult} */ { root }) => {
      const base = await ipfs.bases.getBase(cidBase)
      print(`pinned root\t${root.cid.toString(base.encoder)}\t${root.pinErrorMsg || 'success'}`)
    }

    const options = { timeout, pinRoots }

    if (path) { // files
      for await (const result of ipfs.dag.import(fromFiles(print, path), options)) {
        await handleResult(result)
      }
    } else { // stdin
      print('importing CAR from stdin...')
      for await (const result of ipfs.dag.import([getStdin()], options)) {
        await handleResult(result)
      }
    }
  }
}

/**
 * @param {import('../../types').Context["print"]} print
 * @param {string[]} paths
 */
function * fromFiles (print, paths) {
  for (const path of paths) {
    print(`importing from ${path}...`)
    yield fs.createReadStream(path)
  }
}
