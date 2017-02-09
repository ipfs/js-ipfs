'use strict'

const timers = require('timers')

module.exports = function fake (d) {
  timers.setTimeout(() => d.resolve(), 10)
}
