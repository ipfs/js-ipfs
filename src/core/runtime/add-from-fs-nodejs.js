'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')
const globSource = require('../../utils/files/glob-source')
const isString = require('lodash/isString')

module.exports = self => {
  return promisify((...args) => {
    const callback = args.pop()
    const options = isString(args[args.length - 1]) ? {} : args.pop()
    const paths = args

    pull(
      globSource(...paths, options),
      self.addPullStream(options),
      pull.collect(callback)
    )
  })
}
