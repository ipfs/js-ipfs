'use strict'

const {
  Transform,
  PassThrough
} = require('readable-stream')
const pump = require('pump')
const ndjson = require('ndjson')
const isStream = require('is-stream')

const toEntry = (entry) => {
  return {
    name: entry.Name,
    type: entry.Type,
    size: entry.Size,
    hash: entry.Hash
  }
}

module.exports = (send) => {
  return (args, opts) => {
    opts = opts || {}

    const transform = new Transform({
      objectMode: true,

      transform (entry, encoding, callback) {
        callback(null, toEntry(entry))
      }
    })

    const output = new PassThrough({
      objectMode: true
    })

    send({
      path: 'files/ls',
      args: args,
      qs: Object.assign({}, opts, { stream: true })
    }, (err, res) => {
      if (err) {
        return output.destroy(err)
      }

      if (isStream(res)) {
        const parse = ndjson.parse()

        pump(res, parse, transform, output)
      } else {
        const entries = res.Entries || []

        entries.forEach((entry) => {
          output.write(toEntry(entry))
        })

        output.end()
      }
    })

    return output
  }
}
