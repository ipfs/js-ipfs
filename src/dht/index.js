'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    put: require('./put')(send),
    findprovs: require('./findprovs')(send),
    findpeer: require('./findpeer')(send),
    provide: require('./provide')(send),
    // find closest peerId to given peerId
    query: require('./query')(send)
  }
}
