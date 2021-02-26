'use strict'

const {
  asBoolean,
  stripControlCharacters
} = require('../../utils')
const formatMode = require('ipfs-core-utils/src/files/format-mode')
const formatMtime = require('ipfs-core-utils/src/files/format-mtime')
const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'ls [path]',

  describe: 'List mfs directories',

  builder: {
    long: {
      alias: 'l',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Use long listing format.'
    },
    'cid-base': {
      describe: 'CID base to use.'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs, print },
    path,
    long,
    cidBase,
    timeout
  }) {
    const printListing = file => {
      const name = stripControlCharacters(file.name)

      if (long) {
        print(`${formatMode(file.mode, file.type === 1)}\t${formatMtime(file.mtime)}\t${name}\t${file.cid.toString(cidBase)}\t${file.size}`)
      } else {
        print(name)
      }
    }

    for await (const file of ipfs.files.ls(path || '/', {
      timeout
    })) {
      printListing(file)
    }
  }
}
