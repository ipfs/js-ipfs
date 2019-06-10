'use strict'

const pull = require('pull-stream')
const pullDefer = require('pull-defer')
const { blockKeyToCid } = require('../../utils')

module.exports = function (self) {
  return () => {
    const deferred = pullDefer.source()

    self._repo.blocks.query({ keysOnly: true }, (err, blocks) => {
      if (err) {
        return deferred.resolve(pull.error(err))
      }

      const refs = blocks.map(b => ({
        ref: blockKeyToCid(b.key).toString()
      }))
      deferred.resolve(pull.values(refs))
    })

    return deferred
  }
}
