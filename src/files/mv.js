'use strict'

const promisify = require('promisify-es6')
const findSources = require('../utils/find-sources')

module.exports = (send) => {
  return promisify(function () {
    const {
      callback,
      sources,
      opts
    } = findSources(Array.prototype.slice.call(arguments))

    send({
      path: 'files/mv',
      args: sources,
      qs: opts
    }, (error) => callback(error))
  })
}
