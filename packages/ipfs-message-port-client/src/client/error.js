'use strict'

exports.TimeoutError = class TimeoutError extends Error {
  get name () {
    return this.constructor.name
  }
}

exports.AbortError = class AbortError extends Error {
  get name () {
    return this.constructor.name
  }
}

exports.DisconnectError = class DisconnectError extends Error {
  get name () {
    return this.constructor.name
  }
}
