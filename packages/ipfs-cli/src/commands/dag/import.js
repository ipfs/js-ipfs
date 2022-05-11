import fs from 'fs'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} Argv.path
 * @property {boolean} Argv.pinRoots
 * @property {number} Argv.timeout
 * @property {string} Argv.cidBase
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'import [path...]',

  describe: 'Import the contents of one or more CARs from files or stdin',

  builder: {
    'pin-roots': {
      boolean: true,
      default: true,
      describe: 'Pin optional roots listed in the CAR headers after importing.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command

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
