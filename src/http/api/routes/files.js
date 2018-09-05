'use strict'

const resources = require('./../resources')
const mfs = require('ipfs-mfs/http')
const fs = require('fs')
const path = require('path')
const tempy = require('tempy')
const multipart = require('ipfs-multipart')
const toPull = require('stream-to-pull-stream')
const toStream = require('pull-stream-to-stream')
const pull = require('pull-stream')
const pushable = require('pull-pushable')
const abortable = require('pull-abortable')
const { serialize } = require('pull-ndjson')

const streams = []
const filesDir = tempy.directory()

const responseError = (msg, code, request, abortStream) => {
  const err = JSON.stringify({ Message: msg, Code: code })
  request.raw.res.addTrailers({
    'X-Stream-Error': err
  })
  abortStream.abort()
}
const createMultipartStream = (readStream, boundary, ipfs, request, reply, cb) => {
  const fileAdder = pushable()
  const parser = new multipart.Parser({ boundary: boundary })
  let filesParsed = false

  readStream.pipe(parser)

  parser.on('file', (fileName, fileStream) => {
    console.log('File: ', fileName)
    filesParsed = true
    fileAdder.push({
      path: decodeURIComponent(fileName),
      content: toPull(fileStream)
    })
  })

  parser.on('directory', (directory) => {
    fileAdder.push({
      path: decodeURIComponent(directory),
      content: ''
    })
  })

  parser.on('end', () => {
    console.log('multipart end')
    fileAdder.end()
    if (!filesParsed) {
      reply({
        Message: "File argument 'data' is required.",
        Code: 0,
        Type: 'error'
      }).code(400).takeover()
    }
  })

  const pushStream = pushable()
  const abortStream = abortable()
  const replyStream = toStream.source(pull(
    pushStream,
    abortStream,
    serialize()
  ))

  // Fix Hapi Error: Stream must have a streams2 readable interface
  if (!replyStream._read) {
    replyStream._read = () => {}
    replyStream._readableState = {}
    replyStream.unpipe = () => {}
  }

  // setup reply
  reply(replyStream)
    .header('x-chunked-output', '1')
    .header('content-type', 'application/json')
    .header('Trailer', 'X-Stream-Error')

  const progressHandler = (bytes) => {
    pushStream.push({ Bytes: bytes })
  }
  // ipfs add options
  const options = {
    cidVersion: request.query['cid-version'],
    rawLeaves: request.query['raw-leaves'],
    progress: request.query.progress ? progressHandler : null,
    onlyHash: request.query['only-hash'],
    hashAlg: request.query.hash,
    wrapWithDirectory: request.query['wrap-with-directory'],
    pin: request.query.pin,
    chunker: request.query.chunker
  }

  pull(
    fileAdder,
    ipfs.files.addPullStream(options),
    pull.collect((err, files) => {
      if (err) {
        return responseError(err.msg, 0, request)
      }
      if (files.length === 0) {
        return responseError('Failed to add files.', 0, request)
      }
      console.log(files)
      files.forEach((f) => pushStream.push(f))
      pushStream.end()
    })
  )

  return parser
}
module.exports = (server) => {
  const api = server.select('API')

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/cat',
    config: {
      pre: [
        { method: resources.files.cat.parseArgs, assign: 'args' }
      ],
      handler: resources.files.cat.handler
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/get',
    config: {
      pre: [
        { method: resources.files.get.parseArgs, assign: 'args' }
      ],
      handler: resources.files.get.handler
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/add',
    config: {
      payload: {
        parse: false,
        output: 'stream',
        maxBytes: 10048576
      },
      handler: resources.files.add.handler,
      validate: resources.files.add.validate
    }
  })

  api.route({
    // TODO fix method
    method: 'POST',
    path: '/api/v0/add-chunked',
    config: {
      payload: {
        parse: false,
        maxBytes: 10485760
      },
      handler: (request, reply) => {
        console.log('received')
        console.log(request.headers['content-range'])
        console.log(request.headers['x-ipfs-chunk-index'])
        console.log(request.headers['x-ipfs-chunk-group-uuid'])
        const boundary = request.headers['x-ipfs-chunk-boundary']
        const id = request.headers['x-ipfs-chunk-group-uuid'] // change name to id
        const index = Number(request.headers['x-ipfs-chunk-index'])
        const file = path.join(filesDir, id)
        const match = request.headers['content-range'].match(/(\d+)-(\d+)\/(\d+|\*)/)
        const ipfs = request.server.app.ipfs
        // if (!match || !match[1] || !match[2] || !match[3]) {
        /* malformed content-range header */
        // res.send('Bad Request', 400)
        //   return;
        // }

        const start = parseInt(match[1])
        const end = parseInt(match[2])
        const total = parseInt(match[3])
        // console.log(start, end, total, index, boundary)

        let stream = streams[id]
        if (!stream) {
          console.log('create new stream', file)
          stream = fs.createWriteStream(file, {flags: 'a+'})
          streams[id] = stream
        }

        console.log('stream', file)
        let size = 0
        if (fs.existsSync(file)) {
          size = fs.statSync(file).size
        }

        if ((end + 1) === size) {
          /* duplicate chunk */
          // res.send('Created', 201)
          // return;
        }

        if (start !== size) {
          /* missing chunk */
          // res.send('Bad Request', 400)
          // return;
        }

        if (start === total) {
          // check if size + payload.length === total
          /* all chunks have been received */
          stream.on('finish', function () {
            console.log('add to ipfs from the file')
            var readStream = fs.createReadStream(file)
            createMultipartStream(readStream, boundary, ipfs, request, reply)
          })

          stream.end()
        } else {
          stream.write(request.payload)
          /* this chunk has been processed successfully */
          reply({ Bytes: request.payload.length })
        }
      }
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/ls',
    config: {
      pre: [
        { method: resources.files.immutableLs.parseArgs, assign: 'args' }
      ],
      handler: resources.files.immutableLs.handler
    }
  })

  mfs(api)
}
