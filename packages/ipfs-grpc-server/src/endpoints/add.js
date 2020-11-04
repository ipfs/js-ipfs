'use strict'

// @ts-ignore
const pushable = require('it-pushable')
const { pipe } = require('it-pipe')

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
                // @ts-ignore
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
            streams.filter(Boolean).forEach(stream => stream.end())
          }
        }, 0)

        yield * fileInputStream
      },
      async function (source) {
        for await (const result of ipfs.addAll(source, opts)) {
          result.cid = result.cid.toString()

          if (!result.mtime) {
            delete result.mtime
          } else {
            result.mtime_nsecs = result.mtime.nsecs
            result.mtime = result.mtime.secs
          }

          sink.push({
            type: 'RESULT',
            ...result
          })
        }

        sink.end()
      }
    )
  }

  return add
}
