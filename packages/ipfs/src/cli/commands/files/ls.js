'use strict'

const all = require('it-all')
const {
  asBoolean
} = require('../../utils')
const formatMode = require('ipfs-core-utils/src/files/format-mode')
const formatMtime = require('ipfs-core-utils/src/files/format-mtime')
const parseDuration = require('parse-duration')

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
    sort: {
      alias: 's',
      type: 'boolean',
      default: true,
      coerce: asBoolean,
      describe: 'Sort entries by name'
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
    sort,
    cidBase,
    timeout
  }) {
    const printListing = file => {
      if (long) {
        print(`${formatMode(file.mode, file.type === 1)}\t${formatMtime(file.mtime)}\t${file.name}\t${file.cid.toString(cidBase)}\t${file.size}`)
      } else {
        print(file.name)
      }
    }

    // https://github.com/ipfs/go-ipfs/issues/5181
    if (sort) {
      let files = await all(ipfs.files.ls(path || '/', {
        timeout
      }))

      files = files.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

      files.forEach(printListing)
      return
    }

    for await (const file of ipfs.files.ls(path || '/', {
      timeout
    })) {
      printListing(file)
    }
  }
}
