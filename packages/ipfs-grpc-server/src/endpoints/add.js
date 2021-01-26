'use strict'

// @ts-ignore
const pushable = require('it-pushable')
const { pipe } = require('it-pipe')
const encodeMtime = require('../utils/encode-mtime')

module.exports = function grpcAdd (ipfs, options = {}) {
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
        // @ts-ignore
        const fileInputStream = pushable()

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
          } catch (err) {
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
