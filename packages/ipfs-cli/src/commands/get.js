'use strict'

const fs = require('fs')
const path = require('path')
const toIterable = require('stream-to-it')
const { pipe } = require('it-pipe')
const { map } = require('streaming-iterables')
const parseDuration = require('parse-duration').default
const {
  stripControlCharacters
} = require('../utils')

module.exports = {
  command: 'get <ipfsPath>',

  describe: 'Fetch a file or directory with files references from an IPFS Path',

  builder: {
    output: {
      alias: 'o',
      type: 'string',
      default: process.cwd()
    },
    force: {
      alias: 'f',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, output, force, timeout }) {
    print(`Saving file(s) ${stripControlCharacters(ipfsPath)}`)

    for await (const file of ipfs.get(ipfsPath, {
      timeout
    })) {
      const fullFilePath = path.join(output, file.path)

      if (fullFilePath.substring(0, output.length) !== output && !force) {
        throw new Error(`File prefix invalid, would write to files outside of ${output}, pass --force to override`)
      }

      if (file.content) {
        await fs.promises.mkdir(path.join(output, path.dirname(file.path)), { recursive: true })
        await pipe(
          file.content,
          map(chunk => chunk.slice()), // BufferList to Buffer
          toIterable.sink(fs.createWriteStream(fullFilePath))
        )
      } else {
        // this is a dir
        await fs.promises.mkdir(fullFilePath, { recursive: true })
      }
    }
  }
}
