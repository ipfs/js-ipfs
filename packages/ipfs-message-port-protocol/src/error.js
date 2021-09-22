
/* eslint-env browser */

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
export const encodeError = error => {
  const { name, message, stack, code, detail } = error
  return { name, message, stack, code, detail }
}

/**
 * @param {EncodedError} error
 * @returns {Error}
 */
export const decodeError = error => {
  if (error instanceof Error) {
    return error
  } else {
    const { name, message, stack, code } = error
    return Object.assign(createError(name, message), { name, stack, code })
  }
}

/**
 * Create error by error name.
 *
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
