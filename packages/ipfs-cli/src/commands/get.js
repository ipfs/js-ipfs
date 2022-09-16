import fs from 'fs'
import path from 'path'
// @ts-expect-error no types
import toIterable from 'stream-to-it'
import { pipe } from 'it-pipe'
import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../utils.js'
import { extract } from 'it-tar'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.ipfsPath
 * @property {string} Argv.output
 * @property {boolean} Argv.force
 * @property {number} Argv.timeout
 * @property {boolean} Argv.archive
 * @property {boolean} Argv.compress
 * @property {-1 | 0 | 1 | 2 | 3 | 4 | 5 | 6| 7 | 8| 9} Argv.compressionLevel
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'get <ipfsPath>',

  describe: 'Download IPFS objects',

  builder: {
    output: {
      alias: 'o',
      string: true,
      default: process.cwd()
    },
    force: {
      alias: 'f',
      boolean: true,
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    },
    archive: {
      alias: 'a',
      boolean: true,
      desc: 'Output a TAR archive'
    },
    compress: {
      alias: 'C',
      boolean: true,
      desc: 'Compress the output with GZIP compression'
    },
    compressionLevel: {
      alias: ['l', 'compression-level'],
      number: true,
      desc: 'The level of compression (-1-9)',
      default: 6
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, output, force, timeout, archive, compress, compressionLevel }) {
    print(`Saving file(s) ${stripControlCharacters(ipfsPath)}`)

    if (output.substring(0, output.length) !== output && !force) {
      throw new Error(`File prefix invalid, would write to files outside of ${output}, pass --force to override`)
    }

    if (archive || compress) {
      if (output === process.cwd()) {
        output = path.join(output, ipfsPath)
      }

      await fs.promises.mkdir(path.dirname(output), { recursive: true })
      await pipe(
        ipfs.get(ipfsPath, {
          timeout,
          archive,
          compress,
          compressionLevel
        }),
        toIterable.sink(fs.createWriteStream(output))
      )

      return
    }

    /**
     * @type {any[]}
     */
    await pipe(
      ipfs.get(ipfsPath, {
        timeout,
        archive,
        compress,
        compressionLevel
      }),
      extract(),
      async function extractTarball (source) {
        for await (const { header, body } of source) {
          const outputPath = path.join(output, header.name)

          if (outputPath.substring(0, output.length) !== output && !force) {
            throw new Error(`File prefix invalid, would write to files outside of ${output}, pass --force to override`)
          }

          if (header.type === 'file') {
            await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
            await pipe(
              body,
              toIterable.sink(fs.createWriteStream(outputPath))
            )
          } else if (header.type === 'directory') {
            await fs.promises.mkdir(outputPath, { recursive: true })
          } else {
            throw new Error(`Unknown tar entry type ${header.type}`)
          }

          await fs.promises.chmod(outputPath, header.mode)
          await fs.promises.utimes(outputPath, header.mtime, header.mtime)
        }
      }
    )
  }
}

export default command
