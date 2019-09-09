'use strict'

const callbackify = require('callbackify')

module.exports = () => {
  return callbackify(() => {
    throw new Error('not available in the browser')
  })
}
