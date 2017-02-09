'use strict'

const timers = require('timers')

module.exports = [
  function (d) {
    timers.setTimeout(() => d.resolve(), 5)
  },
  function (d) {
    timers.setTimeout(() => d.resolve(), 6)
  }
]
