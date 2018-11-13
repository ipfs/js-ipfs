'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    cp: require('./cp')(send),
    mkdir: require('./mkdir')(send),
    flush: require('./flush')(send),
    stat: require('./stat')(send),
    rm: require('./rm')(send),
    ls: require('./ls')(send),
    read: require('./read')(send),
    readReadableStream: require('./read-readable-stream')(send),
    readPullStream: require('./read-pull-stream')(send),
    write: require('./write')(send),
    mv: require('./mv')(send)
  }
}
