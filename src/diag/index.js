'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    net: require('./net')(send),
    sys: require('./sys')(send),
    cmds: require('./cmds')(send)
  }
}
