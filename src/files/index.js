'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    add: require('./add')(send),
    addReadableStream: require('./add-readable-stream')(send),
    addPullStream: require('./add-pull-stream')(send),
    cat: require('./cat')(send),
    catReadableStream: require('./cat-readable-stream')(send),
    catPullStream: require('./cat-pull-stream')(send),
    get: require('./get')(send),
    getReadableStream: require('./get-readable-stream')(send),
    getPullStream: require('./get-pull-stream')(send),
    flush: require('./flush')(send),

    // Specific to MFS (for now)
    cp: require('./cp')(send),
    mkdir: require('./mkdir')(send),
    stat: require('./stat')(send),
    rm: require('./rm')(send),
    ls: require('./ls')(send),
    read: require('./read')(send),
    write: require('./write')(send),
    mv: require('./mv')(send)
  }
}
