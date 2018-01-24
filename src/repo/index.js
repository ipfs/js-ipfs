'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    gc: require('./gc')(send),
    stat: require('./stat')(send),
    version: require('./version')(send)
  }
}
