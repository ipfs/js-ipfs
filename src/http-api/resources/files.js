'use strict'

const mh = require('multihashes')
const multipart = require('ipfs-multipart')
const debug = require('debug')
const tar = require('tar-stream')
const log = debug('http-api:files')
log.error = debug('http-api:files:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const pushable = require('pull-pushable')
const EOL = require('os').EOL
const toStream = require('pull-stream-to-stream')

exports = module.exports

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'key' is required").code(400).takeover()
  }

  try {
    return reply({
      key: mh.fromB58String(request.query.arg)
    })
  } catch (err) {
    log.error(err)
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0
    }).code(500).takeover()
  }
}

exports.cat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const ipfs = request.server.app.ipfs

    ipfs.files.cat(key, (err, stream) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to cat file: ' + err,
          Code: 0
        }).code(500)
      }

      // hapi is not very clever and throws if no
      // - _read method
      // - _readableState object
      // are there :(
      if (!stream._read) {
        stream._read = () => {}
        stream._readableState = {}
      }
      return reply(stream).header('X-Stream-Output', '1')
    })
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const ipfs = request.server.app.ipfs
    const pack = tar.pack()

    ipfs.files.getPull(key, (err, stream) => {
      if (err) {
        log.error(err)

        reply({
          Message: 'Failed to get file: ' + err,
          Code: 0
        }).code(500)
        return
      }

      pull(
        stream,
        pull.asyncMap((file, cb) => {
          const header = {name: file.path}
          if (!file.content) {
            header.type = 'directory'
            pack.entry(header)
            cb()
          } else {
            header.size = file.size
            const packStream = pack.entry(header, cb)
            if (!packStream) {
              // this happens if the request is aborted
              // we just skip things then
              log('other side hung up')
              return cb()
            }
            toStream.source(file.content).pipe(packStream)
          }
        }),
        pull.onEnd((err) => {
          if (err) {
            log.error(err)
            pack.emit('error', err)
            pack.destroy()
            return
          }

          pack.finalize()
        })
      )

      // the reply must read the tar stream,
      // to pull values through
      reply(pack).header('X-Stream-Output', '1')
    })
  }
}

exports.add = {
  handler: (request, reply) => {
    if (!request.payload) {
      return reply('Array, Buffer, or String is required.').code(400).takeover()
    }

    const ipfs = request.server.app.ipfs
    // TODO: make pull-multipart
    const parser = multipart.reqParser(request.payload)
    let filesParsed = false

    const fileAdder = pushable()

    parser.on('file', (fileName, fileStream) => {
      const filePair = {
        path: fileName,
        content: toPull(fileStream)
      }
      filesParsed = true
      fileAdder.push(filePair)
    })

    parser.on('directory', (directory) => {
      fileAdder.push({
        path: directory,
        content: ''
      })
    })

    parser.on('end', () => {
      if (!filesParsed) {
        return reply("File argument 'data' is required.")
          .code(400).takeover()
      }
      fileAdder.end()
    })

    pull(
      fileAdder,
      ipfs.files.createAddPullStream(),
      pull.map((file) => {
        return {
          Name: file.path ? file.path : file.hash,
          Hash: file.hash
        }
      }),
      pull.map((file) => JSON.stringify(file) + EOL),
      pull.collect((err, files) => {
        if (err) {
          return reply({
            Message: err,
            Code: 0
          }).code(500)
        }

        if (files.length === 0 && filesParsed) {
          return reply({
            Message: 'Failed to add files.',
            Code: 0
          }).code(500)
        }

        reply(files.join(''))
          .header('x-chunked-output', '1')
          .header('content-type', 'application/json')
      })
    )
  }
}
