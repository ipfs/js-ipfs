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
    argv.resolve((async () => {
      const refParts = argv.cidpath.split('/')
      const cidString = refParts[0]
      const path = refParts.slice(1).join('/')
      const cid = new CID(cidString)
      const { print } = argv

      const options = {
        localResolve: argv.localResolve
      }

      const ipfs = await argv.getIpfs()
      let result

      try {
        result = await ipfs.dag.get(cid, path, options)
      } catch (err) {
        return argv.print(`dag get failed: ${err}`)
      }

      if (options.localResolve) {
        print('resolving path within the node only')
        print(`remainder path: ${result.remainderPath || 'n/a'}\n`)
      }

      const node = result.value

      // TODO we need to find* a way to pretty print objects
      // * reads as 'agree in'
      if (node._json) {
        delete node._json.multihash
        node._json.data = '0x' + node._json.data.toString('hex')
        print(JSON.stringify(node._json))
        return
      }

      if (Buffer.isBuffer(node)) {
        print('0x' + node.toString('hex'))
        return
      }

      if (node.raw) {
        print(node.raw)
      } else {
        print(node)
      }
    })())
  }
}
