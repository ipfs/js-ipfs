'use strict'

module.exports = config => ({
  chmod: require('./chmod')(config),
  cp: require('./cp')(config),
  flush: require('./flush')(config),
  ls: require('./ls')(config),
  mkdir: require('./mkdir')(config),
  mv: require('./mv')(config),
  read: require('./read')(config),
  rm: require('./rm')(config),
  stat: require('./stat')(config),
  touch: require('./touch')(config),
  write: require('./write')(config)
})
