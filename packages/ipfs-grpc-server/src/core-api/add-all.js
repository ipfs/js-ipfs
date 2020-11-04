'use strict'

// @ts-ignore
const pushable = require('it-pushable')
const { pipe } = require('it-pipe')
const debug = require('debug')('ipfs:grpc-server:add-all')

module.exports = function grpcAdd (ipfs, options = {}) {
  async function add (source, sink, metadata) {
    const opts = {
      ...metadata,
      progress: (bytes = 0, path = '') => {
        debug('progress', bytes, path)
        sink.push({
          progress: true,
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
              debug({ index, type, path, mode, mtime, mtimeNsecs, content: Boolean(content)})

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

              if (type === 'DIRECTORY') {
                debug('yielding dir', path)

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

                debug('yielding file', path)
                fileInputStream.push({
                  path,
                  mode: mode !== 0 ? mode : undefined,
                  mtime: mtimeObj,
                  content: stream
                })
                debug('yielded file', path)
              }

              if (content && content.length) {
                // file is in progress
                debug('file in progress', path)
                stream.push(content)
              } else {
                // file is finished
                debug('file ended', path)
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

          debug('returning', result)
          sink.push(result)
        }

        sink.end()
      }
    )
  }

  return add
}
