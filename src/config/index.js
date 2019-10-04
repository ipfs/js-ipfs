'use strict'

module.exports = (send, config) => {
  return {
    get: require('./get')(send),
    set: require('./set')(send),
    replace: require('./replace')(send),
    profiles: {
      apply: require('./profiles/apply')(config),
      list: require('./profiles/list')(config)
    }
  }
}
