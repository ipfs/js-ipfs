'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const CID = require('cids')
const bidiToDuplex = require('../utils/bidi-to-duplex')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

function sendDirectory (index, sink, path, mode, mtime) {
  const message = {
    index,
    type: 'DIRECTORY',
    path
  }

  if (mtime) {
    message.mtime = mtime.secs
    message.mtimeNsecs = mtime.nsecs
  }

  if (mode != null) {
    message.mode = mode
  }

  sink.push(message)
}

async function sendFile (index, sink, content, path, mode, mtime) {
  for await (const buf of content) {
    const message = {
      index,
      type: 'FILE',
      path
    }

    if (mtime) {
      message.mtime = mtime.secs
      message.mtimeNsecs = mtime.nsecs
    }

    if (mode != null) {
      message.mode = mode
    }

    message.content = new Uint8Array(buf, buf.byteOffset, buf.byteLength)

    sink.push(message)
  }

  // signal that the file data has finished
  const message = {
    index,
    type: 'FILE',
    path
  }

  sink.push(message)
}

async function sendFiles (stream, sink) {
  let i = 1

  for await (const { path, content, mode, mtime } of normaliseInput(stream)) {
    const index = i
    i++

    if (content) {
      await sendFile(index, sink, content, path, mode, mtime)
    } else {
      sendDirectory(index, sink, path, mode, mtime)
    }
  }
}

module.exports = function grpcAddAll (grpc, service, opts = {}) {
  async function * addAll (stream, options = {}) {
    const {
      source,
      sink
    } = bidiToDuplex(grpc, service, {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options,
      agent: opts.agent
    })

    sendFiles(stream, sink)
      .catch(err => {
        sink.end(err)
      })
      .finally(() => {
        sink.end()
      })

    for await (const result of source) {
      // received progress result
      if (result.type === 'PROGRESS') {
        if (options.progress) {
          options.progress(result.bytes, result.path)
        }

        continue
      }

      // received file/dir import result
      yield {
        path: result.path,
        cid: new CID(result.cid),
        mode: result.mode,
        mtime: {
          secs: result.mtime || 0,
          nsecs: result.mtimeNsecs || 0
        },
        size: result.size
      }
    }
  }

  return withTimeoutOption(addAll)
}
