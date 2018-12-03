'use strict'

const format = require('format-util')
const assert = require('assert')

const messages = new Map()
const { defineProperty } = Object

/**
 * Get formatted message for a error code
 *
 * @see https://nodejs.org/api/util.html#util_util_format_format_args
 * @param {string} key - Error code
 * @param {Array} args - Placeholder values for the message
 * @returns {string} - Formatted message
 */
function getMessage (key, args) {
  const msg = messages.get(key)

  if (typeof msg === 'function') {
    assert(
      msg.length <= args.length, // Default options do not count.
      `Code: ${key}; The provided arguments length (${args.length}) does not ` +
        `match the required ones (${msg.length}).`
    )
    return msg.apply(null, args)
  }

  const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length
  assert(
    expectedLength === args.length,
    `Code: ${key}; The provided arguments length (${args.length}) does not ` +
      `match the required ones (${expectedLength}).`
  )
  if (args.length === 0) { return msg }

  args.unshift(msg)
  return format.apply(null, args)
}

function makeError (Base, key) {
  return class IPFSError extends Base {
    /**
     * Creates an instance of IPFSError.
     * @param {...Any} args - Message placeholders values
     */
    constructor (...args) {
      super(getMessage(key, args))
    }

    get name () {
      return `${super.name} [${key}]`
    }

    set name (value) {
      defineProperty(this, 'name', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      })
    }

    get code () {
      return key
    }

    set code (value) {
      defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      })
    }
  }
}

function E (sym, val, def) {
  messages.set(sym, val)
  const c = makeError(def, sym)
  c.code = sym
  return c
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
module.exports = {
  ERR_IPFS_MISSING_IPLD_FORMAT: E('ERR_IPFS_MISSING_IPLD_FORMAT', 'Missing IPLD format %s', Error),
  ERR_IPFS_PRELOAD_ABORTED: E('ERR_IPFS_PRELOAD_ABORTED', 'Preload aborted for %s', Error),
  ERR_IPFS_INVALID_PATH: E('ERR_IPFS_INVALID_PATH', 'Invalid IPFS path: %s', TypeError)
}
