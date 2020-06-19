'use strict'

/* eslint-env browser */

// Chrome implements structure clonning of native error types,
// Firefox does not https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
// This does a runtime check to detect if cloning is supported.
const isErrorCloningSupported = (() => {
  try {
    new MessageChannel().port1.postMessage(new Error())
    return true
  } catch (error) {
    return false
  }
})()

/**
 * @typedef {Error|ErrorData} EncodedError
 *
 * Properties added by err-code library
 * @typedef {Object} ErrorExtension
 * @property {string} [code]
 * @property {string} [detail]
 */

/**
 * @typedef {Error & ErrorExtension} ExtendedError
 */

/**
 * @typedef {Object} ErrorData
 * @property {string} name
 * @property {string} message
 * @property {string|undefined} stack
 * @property {string|undefined} code
 * @property {string|undefined} detail
 *
 * @param {ExtendedError} error
 * @returns {EncodedError}
 */
const encodeError = error => {
  if (isErrorCloningSupported) {
    return error
  } else {
    const { name, message, stack, code, detail } = error
    return { name, message, stack, code, detail }
  }
}
exports.encodeError = encodeError

/**
 * @param {EncodedError} error
 * @returns {Error}
 */
const decodeError = error => {
  if (error instanceof Error) {
    return error
  } else {
    const { name, message, stack, code } = error
    return Object.assign(createError(name, message), { name, stack, code })
  }
}
exports.decodeError = decodeError

/**
 * Create error by error name.
 * @param {string} name
 * @param {string} message
 * @returns {Error}
 */
const createError = (name, message) => {
  switch (name) {
    case 'RangeError': {
      return new RangeError(message)
    }
    case 'ReferenceError': {
      return ReferenceError(message)
    }
    case 'SyntaxError': {
      return new SyntaxError(message)
    }
    case 'TypeError': {
      return new TypeError(message)
    }
    case 'URIError': {
      return new URIError(message)
    }
    default: {
      return new Error(message)
    }
  }
}
