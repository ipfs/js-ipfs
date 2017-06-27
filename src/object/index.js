'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    get: require('./get')(send),
    put: require('./put')(send),
    data: require('./data')(send),
    links: require('./links')(send),
    stat: require('./stat')(send),
    new: require('./new')(send),
    patch: {
      addLink: require('./addLink')(send),
      rmLink: require('./rmLink')(send),
      setData: require('./setData')(send),
      appendData: require('./appendData')(send)
    }
  }
}
