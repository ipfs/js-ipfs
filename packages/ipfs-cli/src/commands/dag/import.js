'use strict'

const fs = require('fs')
const { default: parseDuration } = require('parse-duration')
const { cidToString } = require('ipfs-core-utils/src/cid')

/**
 * @typedef {import('ipfs-core-types/src/dag').ImportResult} ImportResult
 */

module.exports = {
  command: 'import [path...]',

  describe: 'Import the contents of one or more CARs from files or stdin',

  builder: {
    'pin-roots': {
      type: 'boolean',
      default: true,
      describe: 'Pin optional roots listed in the CAR headers after importing.'
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
   */
  async handler ({ ctx: { ipfs, print, getStdin }, path, pinRoots, timeout }) {
    const handleResult = (/** @type {ImportResult} */ { blockCount, root }) => {
      if ((blockCount === undefined) === (root === undefined)) { // should only have one of these
        throw new Error('Unexpected result from dag.import')
      }
      if (blockCount !== undefined) {
        print(`imported ${blockCount} blocks`)
      } else {
        print(`pinned root\t${cidToString(root.cid)}\t${root.pinErrorMsg || 'success'}`)
      }
    }

    const options = { timeout, pinRoots }

    if (path) { // files
      for await (const result of ipfs.dag.import(fromFiles(print, path), options)) {
        handleResult(result)
      }
    } else { // stdin
      print('importing CAR from stdin...')
      handleResult(await ipfs.dag.import([getStdin()], timeout))
    }
  }
}

function * fromFiles (print, paths) {
  for (const path of paths) {
    print(`importing from ${path}...`)
    yield fs.createReadStream(path)
  }
}
