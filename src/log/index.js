'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    tail: require('./tail')(send),
    ls: require('./ls')(send),
    level: require('./level')(send)
  }
}
