'use strict'

const { AddRequest, FileType } = require('ipfs-grpc-protocol/dist/root_pb')
const { Root } = require('ipfs-grpc-protocol/dist/root_pb_service')
const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const CID = require('cids')
const toIterator = require('../utils/client-to-iterable')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toHeaders = require('../utils/to-headers')
const debug = require('debug')('ipfs:grpc-client:add-all')

function sendDirectory (index, client, path, mode, mtime) {
  const message = new AddRequest()
  message.setIndex(index)
  message.setType(FileType.DIRECTORY)
  message.setPath(path)

  if (mtime && mtime.secs != null) {
    message.setMtime(mtime.secs)

    if (mtime.nsecs != null) {
      message.setMtimeNsecs(mtime.nsecs)
    }
  }

  if (mode) {
    message.setMode(mode)
  }

  debug('send dir', index, path)
  client.send(message)
}

async function sendFile (index, client, content, path, mode, mtime) {
  for await (const buf of content) {
    const message = new AddRequest()
    message.setIndex(index)
    message.setType(FileType.FILE)
    message.setPath(path)

    if (mode !== undefined) {
      message.setMode(parseInt(mode.toString()))
    }

    if (mtime && mtime.secs !== undefined) {
      message.setMtime(mtime.secs)

      if (mtime.nsecs !== undefined) {
        message.setMtimeNsecs(mtime.nsecs)
      }
    }

    message.setContent(new Uint8Array(buf, buf.byteOffset, buf.byteLength))

    debug('send file data', path)
    client.send(message)
  }

  // signal that the file data has finished
  const message = new AddRequest()
  message.setIndex(index)
  message.setType(FileType.FILE)
  message.setPath(path)

  debug('send file end', path)
  client.send(message)
}

async function sendFiles (client, source, options) {
  try {
    client.start(toHeaders(options))

    let i = 0

    for await (const { path, content, mode, mtime } of normaliseInput(source)) {
      const index = i
      i++

      debug('sending', path)

      if (content) {
        await sendFile(index, client, content, path, mode, mtime)
      } else {
        sendDirectory(index, client, path, mode, mtime)
      }
    }

    debug('sent all the files')
  } finally {
    client.finishSend()
  }
}

module.exports = function grpcAddAll (grpc, opts = {}) {
  opts = opts || {}

  async function * addAll (source, options = {}) {
    let error

    const client = grpc.client(Root.addAll, {
      host: opts.url,
      debug: Boolean(process.env.DEBUG)
    })

    setTimeout(() => {
      sendFiles(client, source, options)
        .catch(err => {
          error = err
        })
    }, 0)

    for await (const result of toIterator(client)) {
      if (error) {
        throw error
      }

      // received progress result
      if (result.progress) {
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
          secs: result.mtime,
          nsecs: result.mtimeNsecs
        },
        size: result.size
      }

      if (error) {
        throw error
      }
    }
  }

  return withTimeoutOption(addAll)
}
