import { exporter, recursive } from 'ipfs-unixfs-exporter'
import errCode from 'err-code'
import { normalizeCidPath } from '../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { CID } from 'multiformats/cid'
import { pack } from 'it-tar'
import { pipe } from 'it-pipe'
import Pako from 'pako'
import toBuffer from 'it-to-buffer'

// https://www.gnu.org/software/gzip/manual/gzip.html
const DEFAULT_COMPRESSION_LEVEL = 6

/**
 * @typedef {object} Context
 * @property {import('ipfs-repo').IPFSRepo} repo
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
export function createGet ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["get"]}
   */
  async function * get (ipfsPath, options = {}) {
    if (options.compressionLevel != null && (options.compressionLevel < -1 || options.compressionLevel > 9)) {
      throw errCode(new Error('Compression level must be between -1 and 9'), 'ERR_INVALID_PARAMS')
    }

    if (options.preload !== false) {
      let pathComponents

      try {
        pathComponents = normalizeCidPath(ipfsPath).split('/')
      } catch (/** @type {any} */ err) {
        throw errCode(err, 'ERR_INVALID_PATH')
      }

      preload(CID.parse(pathComponents[0]))
    }

    const ipfsPathOrCid = CID.asCID(ipfsPath) || ipfsPath
    const file = await exporter(ipfsPathOrCid, repo.blocks, options)

    if (file.type === 'file' || file.type === 'raw') {
      const args = []

      if (!options.compress || options.archive === true) {
        args.push([{
          header: {
            name: file.path,
            mode: file.type === 'file' && file.unixfs.mode,
            mtime: file.type === 'file' && file.unixfs.mtime ? new Date(file.unixfs.mtime.secs * 1000) : undefined,
            size: file.size,
            type: 'file'
          },
          body: file.content()
        }],
        pack()
        )
      } else {
        args.push(
          file.content
        )
      }

      if (options.compress) {
        args.push(
          /**
           * @param {AsyncIterable<Uint8Array>} source
           */
          async function * (source) {
            const buf = await toBuffer(source)

            yield Pako.gzip(buf, {
              level: options.compressionLevel || DEFAULT_COMPRESSION_LEVEL
            })
          }
        )
      }

      // @ts-expect-error cannot derive type
      yield * pipe(...args)

      return
    }

    if (file.type === 'directory') {
      /** @type {any[]} */
      const args = [
        recursive(ipfsPathOrCid, repo.blocks, options),
        /**
         * @param {AsyncIterable<import('ipfs-unixfs-exporter').UnixFSEntry>} source
         */
        async function * (source) {
          for await (const entry of source) {
            /** @type {import('it-tar').TarImportCandidate} */
            const output = {
              header: {
                name: entry.path,
                size: entry.size
              }
            }

            if (entry.type === 'file') {
              output.header.type = 'file'
              output.header.mode = entry.unixfs.mode != null ? entry.unixfs.mode : undefined
              output.header.mtime = entry.unixfs.mtime ? new Date(entry.unixfs.mtime.secs * 1000) : undefined
              output.body = entry.content()
            } else if (entry.type === 'raw') {
              output.header.type = 'file'
              output.body = entry.content()
            } else if (entry.type === 'directory') {
              output.header.type = 'directory'
              output.header.mode = entry.unixfs.mode != null ? entry.unixfs.mode : undefined
              output.header.mtime = entry.unixfs.mtime ? new Date(entry.unixfs.mtime.secs * 1000) : undefined
            } else {
              throw errCode(new Error('Not a UnixFS node'), 'ERR_NOT_UNIXFS')
            }

            yield output
          }
        },
        pack()
      ]

      if (options.compress) {
        if (!options.archive) {
          throw errCode(new Error('file is not regular'), 'ERR_INVALID_PATH')
        }

        if (options.compress) {
          args.push(
            /**
             * @param {AsyncIterable<Uint8Array>} source
             */
            async function * (source) {
              const buf = await toBuffer(source)

              yield Pako.gzip(buf, {
                level: options.compressionLevel || DEFAULT_COMPRESSION_LEVEL
              })
            }
          )
        }
      }

      // @ts-expect-error cannot derive type
      yield * pipe(...args)

      return
    }

    throw errCode(new Error('Not a UnixFS node'), 'ERR_NOT_UNIXFS')
  }

  return withTimeoutOption(get)
}
