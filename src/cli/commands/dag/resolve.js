'use strict'

const CID = require('cids')

module.exports = {
  command: 'resolve <ref>',

  describe: 'fetches a dag node from ipfs, prints its address and remaining path',

  builder: {
    ref: {
      type: 'string'
    }
  },

  handler ({ ref, getIpfs, print, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const options = {}

      try {
        const result = await ipfs.dag.resolve(ref, options)
        let lastCid

        for (const res of result) {
          if (CID.isCID(res.value)) {
            lastCid = res.value
          }
        }

        if (!lastCid) {
          if (ref.startsWith('/ipfs/')) {
            ref = ref.substring(6)
          }

          lastCid = ref.split('/').shift()
        }

        print(lastCid.toString())
      } catch (err) {
        return print(`dag get resolve: ${err}`)
      }
    })())
  }
}
