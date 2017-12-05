'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    bitswap: require('./bitswap')(send),
    bw: require('./bw')(send),
    repo: require('./repo')(send)
  }
}
