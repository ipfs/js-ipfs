'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    stat: require('./stat')(send),
    put: require('./put')(send)
  }
}
