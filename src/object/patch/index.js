'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  addLink: callbackify.variadic(require('./add-link')(config)),
  appendData: callbackify.variadic(require('./append-data')(config)),
  rmLink: callbackify.variadic(require('./rm-link')(config)),
  setData: callbackify.variadic(require('./set-data')(config))
})
