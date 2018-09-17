'use strict'

const fs = require('fs')
const path = require('path')
const { EOL } = require('os')
const { Readable } = require('stream')
const glob = require('fast-glob')
const StreamConcat = require('stream-concat')
const del = require('del')
const content = require('content')
const { Parser } = require('ipfs-multipart')

const processAndAdd = (uuid, filesDir, request, reply) => {
  // all chunks have been received
  // TODO : here we have full size we can calculate the number of chunks to validate we have all the bytes
  const base = path.join(filesDir, uuid) + '-'
  const pattern = base + '*'
  const files = glob.sync(pattern)

  files.sort((a, b) => {
    return Number(a.replace(base, '')) - Number(b.replace(base, ''))
  })

  let fileIndex = 0
  const nextStream = () => fileIndex === files.length
    ? null
    : fs.createReadStream(files[fileIndex++])

  createMultipartReply(
    new StreamConcat(nextStream),
    request,
    reply,
    (err) => {
      if (err) {
        return reply(err)
      }
      del(pattern, { force: true })
        .then(paths => {
          console.log('Deleted files and folders:\n', paths.join('\n'))
        })
        .catch(console.error)
    }
  )
}

const matchMultipartEnd = (file, boundary, cb) => {
  const buffer = Buffer.alloc(56)
  const fs = require('fs')
  fs.open(file, 'r', (err, fd) => {
    if (err) {
      cb(err)
    }

    fs.fstat(fd, (err, stats) => {
      if (err) {
        cb(err)
      }

      fs.read(fd, buffer, 0, buffer.length, stats.size - 58, function (e, l, b) {
        cb(null, b.toString().includes(boundary))
      })
      fs.close(fd)
    })
  })
}

const parseChunkedInput = (request) => {
  const input = request.headers['x-chunked-input']
  const regex = /^uuid="([^"]+)";\s*index=(\d*)/i

  if (!input) {
    return null
  }
  const match = input.match(regex)

  return [match[1], Number(match[2])]
}

const createMultipartReply = (readStream, request, reply, cb) => {
  const boundary = content.type(request.headers['content-type']).boundary
  const ipfs = request.server.app.ipfs
  const query = request.query
  const parser = new Parser({ boundary: boundary })
  const replyStream = new Readable({ read: () => {} })
  const serialize = d => JSON.stringify(d) + EOL
  const progressHandler = (bytes) => {
    replyStream.push(serialize({ Bytes: bytes }))
  }
  // ipfs add options
  const options = {
    cidVersion: query['cid-version'],
    rawLeaves: query['raw-leaves'],
    progress: query.progress ? progressHandler : null,
    onlyHash: query['only-hash'],
    hashAlg: query.hash,
    wrapWithDirectory: query['wrap-with-directory'],
    pin: query.pin,
    chunker: query.chunker
  }
  const addStream = ipfs.files.addReadableStream(options)

  // Setup add pipeline
  addStream.on('data', file => {
    replyStream.push(serialize({
      Name: file.path,
      Hash: file.hash,
      Size: file.size
    }))
  })
  addStream.on('end', () => replyStream.push(null))
  addStream.on('error', cb)

  // Setup multipart parser
  parser.on('file', (fileName, fileStream) => {
    addStream.write({
      path: decodeURIComponent(fileName),
      content: fileStream
    })
  })
  parser.on('directory', (directory) => {
    addStream.write({
      path: decodeURIComponent(directory),
      content: ''
    })
  })
  parser.on('end', () => {
    addStream.end()
  })
  parser.on('error', cb)

  // Send replyStream to reply
  reply(replyStream)
    .header('x-chunked-output', '1')
    .header('content-encoding', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
    .header('content-type', 'application/json')

  // start piping data to multipart parser
  readStream.pipe(parser)
}

module.exports = {
  processAndAdd,
  matchMultipartEnd,
  parseChunkedInput,
  createMultipartReply
}
