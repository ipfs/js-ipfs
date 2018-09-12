'use strict'

const fs = require('fs')
const path = require('path')
const tempy = require('tempy')
const del = require('del')
const StreamConcat = require('stream-concat')
const boom = require('boom')
const pump = require('pump')
const glob = require('fast-glob')
const Joi = require('joi')
const content = require('content')
const { Parser } = require('ipfs-multipart')
const toPull = require('stream-to-pull-stream')
const toStream = require('pull-stream-to-stream')
const pull = require('pull-stream')
const pushable = require('pull-pushable')
const abortable = require('pull-abortable')
const { serialize } = require('pull-ndjson')
const mfs = require('ipfs-mfs/http')
const resources = require('./../resources')

const filesDir = tempy.directory()

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
  const fileAdder = pushable()
  const boundary = content.type(request.headers['content-type']).boundary
  const ipfs = request.server.app.ipfs
  const query = request.query
  const parser = new Parser({ boundary: boundary })
  readStream.pipe(parser)

  parser.on('file', (fileName, fileStream) => {
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
    fileAdder.end()
  })

  parser.on('error', err => cb(err))

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

  const progressHandler = (bytes) => {
    pushStream.push({ Bytes: bytes })
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

  pull(
    fileAdder,
    ipfs.files.addPullStream(options),
    pull.collect((err, files) => {
      if (err) {
        pushStream.push({
          Message: err.toString(),
          Code: 0,
          Type: 'error'
        })
        pushStream.end()
        return
      }
      files.forEach((f) => pushStream.push(f))
      pushStream.end()
      cb()
    })
  )
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
        // output: 'stream',
        maxBytes: 10048576
      },
      handler: resources.files.add.handler,
      validate: resources.files.add.validate
    }
  })

  api.route({
    method: 'POST',
    path: '/api/v0/add-chunked',
    config: {
      payload: {
        parse: false,
        output: 'stream',
        maxBytes: 1000 * 1024 * 1024
        // maxBytes: 10485760
      },
      validate: {
        headers: {
          'content-range': Joi.string().regex(/(\d+)-(\d+)\/(\d+|\*)/),
          'x-chunked-input': Joi.string().regex(/^uuid="([^"]+)";\s*index=(\d*)/i)
        },
        options: {
          allowUnknown: true
        }
      },
      handler: (request, reply) => {
        const chunkedInput = parseChunkedInput(request)

        if (boom.isBoom(chunkedInput)) {
          return reply(chunkedInput)
        }

        // non chunked
        if (!chunkedInput) {
          createMultipartReply(
            request.payload,
            request,
            reply,
            (err) => {
              if (err) {
                return reply(err)
              }
              console.log('Finished adding')
            }
          )

          return
        }

        // chunked
        const [uuid, index] = chunkedInput
        const [, start, , total] = request.headers['content-range'].match(/(\d+)-(\d+)\/(\d+|\*)/)
        const file = path.join(filesDir, uuid) + '-' + index

        // TODO validate duplicates, missing chunks

        if (start === total) {
          /* all chunks have been received */
          const base = path.join(filesDir, uuid) + '-'
          const pattern = base + '*'
          const files = glob.sync(pattern)

          files.sort((a, b) => {
            return Number(a.replace(base, '')) - Number(b.replace(base, ''))
          })

          let fileIndex = 0
          const nextStream = () => fileIndex === files.length ? null : fs.createReadStream(files[fileIndex++])
          createMultipartReply(
            new StreamConcat(nextStream),
            request,
            reply,
            (err) => {
              if (err) {
                return reply(err)
              }

              console.log('Finished adding')
              del(pattern, { force: true })
                .then(paths => {
                  console.log('Deleted files and folders:\n', paths.join('\n'))
                })
                .catch(console.error)
            }
          )
        } else {
          pump(
            request.payload,
            fs.createWriteStream(file),
            (err) => {
              if (err) {
                return reply(err)
              }
              reply({ Bytes: total })
            }
          )
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
