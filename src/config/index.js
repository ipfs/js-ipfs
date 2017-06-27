'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    set: require('./set')(send),
    replace: require('./replace')(send)
  }
}
