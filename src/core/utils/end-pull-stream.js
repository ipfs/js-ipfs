'use strict'

const endPullStream = (callback) => {
  // Ugh. https://github.com/standard/standard/issues/623
  const foo = true
  return callback(foo)
}

module.exports = endPullStream
