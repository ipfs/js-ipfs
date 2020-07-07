'use strict'

const modeToString = require('./mode-to-string')

const modeToHeaders = (mode) => {
  const value = modeToString(mode)
  if (value != null) {
    return { mode: value }
  } else {
    return undefined
  }
}

module.exports = modeToHeaders
