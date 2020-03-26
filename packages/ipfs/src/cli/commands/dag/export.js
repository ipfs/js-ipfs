'use strict'

const CID = require('cids')
const CAR = require('datastore-car')
const Block = require('@ipld/block')

module.exports = {
  command: 'export <cid>',

  describe: 'Streams the selected DAG as a CAR to stdout.',

  async handler ({ ctx, cid }) {
    const { ipfs, print } = ctx
    const root = new CID(cid)

    // getter interface for CAR.completeGraph
    const get = async (cid) => {
      const result = await ipfs.block.get(cid)
      const block = Block.create(result.data, result.cid)
      return block
    }

    try {
      const car = await CAR.writeStream(process.stdout)
      await CAR.completeGraph(root, get, car)
    } catch (err) {
      // TODO: should we print a special error for a failed ipfs.block.get() like `ipfs dag get`?
      return print(`failed to compile export graph: ${err}`, true, true)
    }
  }
}
