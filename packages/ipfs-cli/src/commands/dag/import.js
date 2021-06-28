'use strict'

const fs = require('fs')
const { CarBlockIterator } = require('@ipld/car/iterator')
const Block = require('ipld-block')
const LegacyCID = require('cids')
const { default: parseDuration } = require('parse-duration')
const { cidToString } = require('ipfs-core-utils/src/cid')

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {[CID, boolean][]} RootsStatus
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
    let count = 0
    /** @type {RootsStatus} */
    let pinRootStatus = []
    if (path) { // files
      for await (const file of path) {
        print(`importing from ${file}...`)
        const { rootStatus, blockCount } = await importCar(ipfs, fs.createReadStream(file), timeout)
        pinRootStatus = pinRootStatus.concat(rootStatus)
        count += blockCount
      }
    } else { // stdin
      print('importing CAR from stdin...')
      const { rootStatus, blockCount } = await importCar(ipfs, getStdin(), timeout)
      pinRootStatus = pinRootStatus.concat(rootStatus)
      count += blockCount
    }

    print(`imported ${count} blocks`)

    if (pinRoots) {
      for (const [cid, status] of pinRootStatus) {
        if (!status) {
          print(`got malformed CAR, not pinning nonexistent root ${cid.toString()}`)
        }
      }
      const pinCids = pinRootStatus
        .filter(([_, status]) => status)
        .map(([cid]) => ({ cid: new LegacyCID(cid.bytes) }))
      for await (const cid of ipfs.pin.addAll(pinCids)) {
        print(`pinned root ${cidToString(cid)}`)
      }
    }
  }
}

/**
 * @param {IPFS} ipfs
 * @param {AsyncIterable<Uint8Array>} inStream
 * @param {number} timeout
 * @returns {Promise<{rootStatus: RootsStatus, blockCount: number}>}
 */
async function importCar (ipfs, inStream, timeout) {
  const reader = await CarBlockIterator.fromIterable(inStream)
  // keep track of whether the root(s) exist within the CAR or not for later reporting & pinning
  /** @type {RootsStatus} */
  const rootStatus = (await reader.getRoots()).map((/** @type {CID} */ root) => [root, false])
  let blockCount = 0
  for await (const { cid, bytes } of reader) {
    rootStatus.forEach((rootStatus) => {
      if (!rootStatus[1] && cid.equals(rootStatus[0])) {
        rootStatus[1] = true // the root points to a CID in the CAR
      }
    })
    const block = new Block(bytes, new LegacyCID(cid.bytes))
    await ipfs.block.put(block, { timeout })
    blockCount++
  }
  return { rootStatus, blockCount }
}
