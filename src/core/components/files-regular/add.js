'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')
const sort = require('pull-sort')
const isSource = require('is-pull-stream').isSource
const validateAddInput = require('ipfs-utils/src/files/add-input-validation')

module.exports = function (self) {
  const add = promisify((data, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    try {
      validateAddInput(data)
    } catch (err) {
      return callback(err)
    }

    pull(
      pull.values([data]),
      self.addPullStream(options),
      sort((a, b) => {
        if (a.path < b.path) return 1
        if (a.path > b.path) return -1
        return 0
      }),
      pull.collect(callback)
    )
  })

  return function () {
    const args = Array.from(arguments)

    // If we .add(<pull stream>), then promisify thinks the pull stream
    // is a callback! Add an empty options object in this case so that a
    // promise is returned.
    if (args.length === 1 && isSource(args[0])) {
      args.push({})
    }

    return add.apply(null, args)
  }
}
