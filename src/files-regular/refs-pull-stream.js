'use strict'

const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')
const moduleConfig = require('../utils/module-config')
const { checkArgs, normalizeOpts } = require('./refs')

module.exports = (send) => {
  send = moduleConfig(send)

  return (args, opts) => {
    opts = normalizeOpts(opts)

    const p = deferred.source()

    try {
      args = checkArgs(args)
    } catch (err) {
      return p.end(err)
    }

    send({ path: 'refs', args, qs: opts }, (err, stream) => {
      if (err) { return p.resolve(pull.error(err)) }

      p.resolve(pull(
        toPull.source(stream),
        pull.map(r => ({ ref: r.Ref, err: r.Err }))
      ))
    })

    return p
  }
}
