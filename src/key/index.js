'use strict'

const callbackify = require('callbackify')

module.exports = config => ({
  gen: callbackify.variadic(require('./gen')(config)),
  list: callbackify.variadic(require('./list')(config)),
  rename: callbackify.variadic(require('./rename')(config)),
  rm: callbackify.variadic(require('./rm')(config)),
  export: callbackify.variadic(require('./export')(config)),
  import: callbackify.variadic(require('./import')(config))
})
