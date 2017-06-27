'use strict'

const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return require('./files/cat')(send)
}
