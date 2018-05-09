'use strict'

// A pull stream source that will emit buffers full of zeros up to the specified length
const zeros = (max = Infinity, increment = 4096) => {
  let i = 0

  return (end, cb) => {
    if (end) {
      return cb && cb(end)
    }

    if (i >= max) {
      // Ugh. https://github.com/standard/standard/issues/623
      const foo = true
      return cb(foo)
    }

    let nextLength = increment

    if ((i + nextLength) > max) {
      // final chunk doesn't divide neatly into increment
      nextLength = max - i
    }

    i += nextLength

    cb(null, Buffer.alloc(nextLength, 0))
  }
}

module.exports = zeros
