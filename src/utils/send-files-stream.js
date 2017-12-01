'use strict'

const Duplex = require('stream').Duplex
const eachSeries = require('async/eachSeries')
const isStream = require('is-stream')
const once = require('once')
const prepareFile = require('./prepare-file')
const Multipart = require('./multipart')
const Converter = require('./converter').ConverterStream

function headers (file) {
  const name = file.path
    ? encodeURIComponent(file.path)
    : ''

  const header = { 'Content-Disposition': `file; filename="${name}"` }

  if (!file.content) {
    header['Content-Type'] = 'application/x-directory'
  } else if (file.symlink) {
    header['Content-Type'] = 'application/symlink'
  } else {
    header['Content-Type'] = 'application/octet-stream'
  }

  return header
}

module.exports = (send, path) => {
  return (options) => {
    let request
    let ended = false
    let writing = false

    options = options || {}

    const multipart = new Multipart()

    const retStream = new Duplex({ objectMode: true })

    retStream._read = (n) => {}

    retStream._write = (file, enc, _next) => {
      const next = once(_next)
      try {
        const files = prepareFile(file, Object.assign({}, options, options.qs))
          .map((file) => Object.assign({headers: headers(file)}, file))

        writing = true
        eachSeries(
          files,
          (file, cb) => multipart.write(file, enc, cb),
          (err) => {
            writing = false
            if (err) {
              return next(err)
            }
            if (ended) {
              multipart.end()
            }
            next()
          })
      } catch (err) {
        next(err)
      }
    }

    retStream.once('finish', () => {
      if (!ended) {
        ended = true
        if (!writing) {
          multipart.end()
        }
      }
    })

    const qs = options.qs || {}

    if (options['cid-version'] != null) {
      qs['cid-version'] = options['cid-version']
    } else if (options.cidVersion != null) {
      qs['cid-version'] = options.cidVersion
    }

    if (options['raw-leaves'] != null) {
      qs['raw-leaves'] = options['raw-leaves']
    } else if (options.rawLeaves != null) {
      qs['raw-leaves'] = options.rawLeaves
    }

    if (options.hash != null) {
      qs.hash = options.hash
    } else if (options.hashAlg != null) {
      qs.hash = options.hashAlg
    }

    const args = {
      path: path,
      qs: qs,
      args: options.args,
      multipart: true,
      multipartBoundary: multipart._boundary,
      stream: true,
      recursive: true,
      progress: options.progress
    }

    multipart.on('error', (err) => {
      retStream.emit('error', err)
    })

    request = send(args, (err, response) => {
      if (err) {
        return retStream.emit('error', err)
      }

      if (!response) {
        // no response, which means everything is ok, so we end the retStream
        return retStream.push(null) // early
      }

      if (!isStream(response)) {
        retStream.push(response)
        retStream.push(null)
        return
      }

      response.on('error', (err) => retStream.emit('error', err))

      response.on('data', (d) => {
        if (d.Bytes && options.progress) {
          options.progress(d.Bytes)
        }
      })
      const convertedResponse = new Converter()
      convertedResponse.once('end', () => retStream.push(null))
      convertedResponse.on('data', (d) => retStream.push(d))
      response.pipe(convertedResponse)
    })

    // signal the multipart that the underlying stream has drained and that
    // it can continue producing data..
    request.on('drain', () => multipart.emit('drain'))

    multipart.pipe(request)

    return retStream
  }
}
