'use strict'

const multibase = require('multibase')
const all = require('it-all')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  // bracket syntax with '...' tells yargs to optionally accept a list
  command: 'ls [ipfsPath...]',

  describe: 'List objects pinned to local storage.',

  builder: {
    type: {
      type: 'string',
      alias: 't',
      default: 'all',
      choices: ['direct', 'indirect', 'recursive', 'all'],
      describe: 'The type of pinned keys to list.'
    },
    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false,
      describe: 'Write just hashes of objects.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    stream: {
      type: 'boolean',
      alias: 's',
      default: false,
      describe: 'Enable streaming of pins as they are discovered.'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, type, quiet, cidBase, stream, timeout }) {
    const printPin = res => {
      let line = cidToString(res.cid, { base: cidBase })
      if (!quiet) {
        line += ` ${res.type}`

        if (res.comments) {
          line += ` ${res.comments}`
        }
      }
      print(line)
    }

    if (!stream) {
      const pins = await all(ipfs.pin.ls({
        paths: ipfsPath,
        type,
        stream: false,
        timeout
      }))
      return pins.forEach(printPin)
    }

    for await (const res of ipfs.pin.ls({
      paths: ipfsPath,
      type,
      timeout
    })) {
      printPin(res)
    }
  }
}
