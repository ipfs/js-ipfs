import { pushable } from 'it-pushable'
import { pipe } from 'it-pipe'
import { encodeMtime } from '../utils/encode-mtime.js'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../types').Options} options
 */
export function grpcAdd (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../types').BidirectionalStreamingEndpoint<any, any, any>}
   */
  async function add (source, sink, metadata) {
    const opts = {
      ...metadata,
      progress: (bytes = 0, path = '') => {
        sink.push({
          type: 'PROGRESS',
          bytes,
          path
        })
      }
    }

    await pipe(
      async function * toInput () {
        const fileInputStream = pushable({ objectMode: true })

        setTimeout(async () => {
          const streams = []

          try {
            for await (const { index, type, path, mode, mtime, mtimeNsecs, content } of source) {
              let mtimeObj

              if (mtime != null) {
                mtimeObj = {
                  secs: mtime,
                  nsecs: undefined
                }

                if (mtimeNsecs != null) {
                  mtimeObj.nsecs = mtimeNsecs
                }
              }

              if (!type || type === 'DIRECTORY') {
                // directory
                fileInputStream.push({
                  path,
                  mode: mode !== 0 ? mode : undefined,
                  mtime: mtimeObj
                })

                continue
              }

              let stream = streams[index]

              if (!stream) {
                // start of new file
                stream = streams[index] = pushable()

                fileInputStream.push({
                  path,
                  mode: mode !== 0 ? mode : undefined,
                  mtime: mtimeObj,
                  content: stream
                })
              }

              if (content && content.length) {
                // file is in progress
                stream.push(content)
              } else {
                // file is finished
                stream.end()

                streams[index] = null
              }
            }

            fileInputStream.end()
          } catch (/** @type {any} */ err) {
            fileInputStream.end(err)
          } finally {
            // clean up any open streams
            streams.forEach(stream => stream && stream.end())
          }
        }, 0)

        yield * fileInputStream
      },
      async function (source) {
        for await (const result of ipfs.addAll(source, opts)) {
          sink.push({
            ...result,
            type: 'RESULT',
            cid: result.cid.toString(),
            ...encodeMtime(result.mtime)
          })
        }

        sink.end()
      }
    )
  }

  return add
}
