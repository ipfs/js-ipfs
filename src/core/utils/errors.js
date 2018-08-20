'use strict'

class NonFatalError extends Error {
  constructor (message) {
    super(message)

    this.code = 0
  }
}

class FatalError extends Error {
  constructor (message) {
    super(message)

    this.code = 1
  }
}

module.exports = {
  NonFatalError,
  FatalError
}
