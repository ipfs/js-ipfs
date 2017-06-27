'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    wantlist: require('./wantlist')(send),
    stat: require('./stat')(send),
    unwant: require('./unwant')(send)
  }
}
