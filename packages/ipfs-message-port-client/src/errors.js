'use strict'

class AbortError extends Error {}
class ClosedError extends Error {}

module.exports = { AbortError, ClosedError }
