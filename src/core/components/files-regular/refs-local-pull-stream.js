'use strict'

const pull = require('pull-stream')
const pullDefer = require('pull-defer')

module.exports = function (self) {
  return () => {
    const deferred = pullDefer.source()

    self.refs.local()
      .catch((err) => deferred.resolve(pull.error(err)))
      .then((refs) => deferred.resolve(pull.values(refs)))

    return deferred
  }
}
