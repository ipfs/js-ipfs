'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')
const globSource = require('../../utils/files/glob-source')

module.exports = self => {
  return promisify((...args) => {
    const callback = args.pop()
    const options = typeof args[args.length - 1] === 'string' ? {} : args.pop()
    const paths = args

    pull(
      globSource(...paths, options),
      self.addPullStream(options),
      pull.collect(callback)
    )
  })
}
