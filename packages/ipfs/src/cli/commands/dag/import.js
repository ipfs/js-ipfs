'use strict'

const fs = require('fs')
const CID = require('cids')
const CAR = require('datastore-car')
const Block = require('ipfs-block')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'import [carfile...]',

  describe: 'Import the contents of CAR files from disk or stdin.',

  async handler ({ ctx, carfile }) {
    const { ipfs, print, getStdin } = ctx
    let count = 0

    if (carfile) { // files
      for await (const file of carfile) {
        print(`importing from ${file}...`)
        count += await importCar(ipfs, print, fs.createReadStream(file))
      }
    } else { // stdin
      print('importing CAR from stdin...')
      count = await importCar(ipfs, print, getStdin())
    }

    print(`imported ${count} blocks`)
  }
}

async function importCar (ipfs, print, inStream) {
  const car = await CAR.readStreaming(inStream)
  const roots = await car.getRoots()
  const rootStatus = roots.reduce((p, cid) => {
    p[cid.toString()] = false
    return p
  }, {})
  let count = 0

  // CAR.readStreaming acts like a datastore that we can streaming query()
  for await (const { key, value } of car.query()) {
    // key is the cid as a string and value is the binary block data
    const cid = new CID(key)
    const block = new Block(value, cid)
    await ipfs.block.put(block)
    if (rootStatus[key] !== undefined) {
      // TODO: what if it's already true? double block in the CAR!
      rootStatus[key] = true
    }
    count++
  }

  // A well-formed CAR will have roots that reference blocks that actually exist
  // in the CAR body, but that may not be the case. Don't try to pin if the root
  // didn't exist in the body.
  // TODO: ^ go-car currently attempts to pin roots even if they don't exist in
  // the CAR body, need to align behaviour
  for (const [cid, found] of Object.entries(rootStatus)) {
    if (!found) {
      print(`malformed CAR, not pinning nonexistent root ${cidToString(cid)}`)
      continue
    }
    const pinResults = await ipfs.pin.add(cid) // TODO: make it recursive or direct? { recursive: true }
    pinResults.forEach((res) => {
      print(`pinned root ${cidToString(res.cid)}`)
    })
  }

  // TODO: handle zero-roots case?

  return count
}
