'use strict'

const resources = require('./../resources')
const mfs = require('ipfs-mfs/http')
const fs = require('fs')
const path = require('path')
const tempy = require('tempy')
const multipart = require('ipfs-multipart')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const pushable = require('pull-pushable')

const streams = []
const filesDir = tempy.directory()

const createMultipartStream = (readStream, boundary, ipfs, cb) => {
  const parser = new multipart.Parser({ boundary: boundary })
  readStream.pipe(parser)
  const fileAdder = pushable()

  parser.on('file', (fileName, fileStream) => {
    fileName = decodeURIComponent(fileName)

    const filePair = {
      path: fileName,
      content: toPull(fileStream)
    }
    console.log(filePair)
    fileAdder.push(filePair)
  })

  parser.on('directory', (directory) => {
    directory = decodeURIComponent(directory)
    fileAdder.push({
      path: directory,
      content: ''
    })
  })

  parser.on('end', () => {
    fileAdder.end()
  })

  pull(
    fileAdder,
    ipfs.files.addPullStream(),
    pull.map((file) => {
      return {
        Name: file.path, // addPullStream already turned this into a hash if it wanted to
        Hash: file.hash,
        Size: file.size
      }
    }),
    pull.collect((err, files) => {
      if (err) {
        cb(err)
        return
      }
      cb(null, files)
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
        maxBytes: 10048576
      },
      handler: (request, reply) => {
        console.log('received')
        console.log(request.headers['content-range'])
        console.log(request.headers['ipfs-chunk-id'])
        console.log(request.headers['ipfs-chunk-name'])
        const boundary = request.headers['ipfs-chunk-boundary']
        const id = request.headers['ipfs-chunk-name'] // change name to id
        const index = Number(request.headers['ipfs-chunk-id'])
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

        if (index === -1) {
          // check if size + payload.length === total
          /* all chunks have been received */
          stream.on('finish', function () {
            console.log('add to ipfs from the file')
            var readStream = fs.createReadStream(file)
            createMultipartStream(readStream, boundary, ipfs, (err, files) => {
              if (err) {
                console.error(err)
              }
              console.log('finished adding to ipfs', files)
              reply({files})
            })
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
