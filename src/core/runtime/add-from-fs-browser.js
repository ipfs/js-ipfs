'use strict'

const promisify = require('promisify-es6')

module.exports = self => {
  return promisify((...args) => {
    const callback = args.pop()
    callback(new Error('not available in the browser'))
  })
}
