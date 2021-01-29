'use strict'

const { default: parseDuration } = require('parse-duration')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const uint8ArrayToString = require('uint8arrays/to-string')
const { cidToString } = require('ipfs-core-utils/src/cid')
const {
  stripControlCharacters,
  makeEntriesPrintable,
  escapeControlCharacters
} = require('../../utils')
const multibase = require('multibase')

module.exports = {
  command: 'get <cid path>',

  describe: 'Get a dag node or value from ipfs.',

  builder: {
    'local-resolve': {
      type: 'boolean',
      default: false
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    'data-enc': {
      describe: 'String encoding to display data in.',
      type: 'string',
      choices: ['base16', 'base64', 'base58btc'],
      default: 'base64'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, cidpath, cidBase, dataEnc, localResolve, timeout }) {
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

    if (cid.codec === 'dag-pb') {
      print(JSON.stringify({
        data: node.Data ? uint8ArrayToString(node.Data, dataEnc) : undefined,
        links: (node.Links || []).map(link => ({
          Name: stripControlCharacters(link.Name),
          Size: link.Size,
          Cid: { '/': cidToString(link.Hash, { base: cidBase }) }
        }))
      }))
    } else if (cid.codec === 'raw') {
      print(uint8ArrayToString(node, dataEnc))
    } else if (cid.codec === 'dag-cbor') {
      print(JSON.stringify(makeEntriesPrintable(node, cidBase)))
    } else {
      print(escapeControlCharacters(node.toString()))
    }
  }
}
