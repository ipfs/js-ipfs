'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    gen: require('./gen')(send),
    list: require('./list')(send)
  }
}
