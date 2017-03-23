'use strict'

const CID = require('cids')

module.exports = {
  command: 'get <cid path>',

  describe: 'Get a dag node or value from ipfs.',

  builder: {
    'local-resolve': {
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    const refParts = argv.cidpath.split('/')
    const cidString = refParts[0]
    const path = refParts.slice(1).join('/')
    const cid = new CID(cidString)

    const options = {
      localResolve: argv.localResolve
    }

    argv.ipfs.dag.get(cid, path, options, (err, result) => {
      if (err) {
        return console.log('dag get failed:', err.message)
      }

      if (options.localResolve) {
        console.log('resolving path within the node only')
        console.log('remainder path:', result.remainderPath || 'n/a', '\n')
      }

      const node = result.value

      // TODO we need to find* a way to pretty print objects
      // * reads as 'agree in'
      if (node._json) {
        delete node._json.multihash
        node._json.data = '0x' + node._json.data.toString('hex')
        console.log(node._json)
        return
      }

      if (Buffer.isBuffer(node)) {
        console.log('0x' + node.toString('hex'))
        return
      }

      if (node.raw) {
        console.log(node.raw)
      } else {
        console.log(node)
      }
    })
  }
}
