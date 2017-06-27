'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    add: require('./add')(send),
    createAddStream: require('./create-add-stream')(send),
    get: require('./get')(send),
    cat: require('./cat')(send),
    cp: require('./cp')(send),
    ls: require('./ls')(send),
    mkdir: require('./mkdir')(send),
    stat: require('./stat')(send),
    rm: require('./rm')(send),
    read: require('./read')(send),
    write: require('./write')(send),
    mv: require('./mv')(send)
  }
}
