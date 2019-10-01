'use strict'

const callbackify = require('callbackify')

module.exports = () => {
  return callbackify(async () => { // eslint-disable-line require-await
    throw new Error('not available in the browser')
  })
}
