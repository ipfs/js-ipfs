'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    add: require('./add')(send),
    rm: require('./rm')(send),
    list: require('./list')(send)
  }
}
