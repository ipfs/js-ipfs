'use strict'

const parseDuration = require('parse-duration').default
const { Buffer } = require('buffer')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

module.exports = {
  command: 'get <cid path>',

  describe: 'Get a dag node or value from ipfs.',

  builder: {
    'local-resolve': {
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, cidpath, localResolve, timeout }) {
    const options = {
      localResolve,
      timeout
    }

    const {
      cid, path
    } = toCidAndPath(cidpath)

    let result

    try {
      result = await ipfs.dag.get(cid, {
        ...options,
        path
      })
    } catch (err) {
      return print(`dag get failed: ${err}`)
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
      print(JSON.stringify(node._json, null, 4))
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
  }
}
