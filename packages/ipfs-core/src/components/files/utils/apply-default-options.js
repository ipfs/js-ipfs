'use strict'

const errCode = require('err-code')

/**
 * @template {{}} Options
 * @template {{parents?:boolean, long?:boolean, length?:number, offset?:number}} Ext
 * @param {Partial<Options> & {count?:number, p?:boolean, l?:boolean}} options
 * @param {Options | Options & Ext} defaults
 * @returns {Options}
 */
module.exports = (options = {}, defaults) => {
  if (Array.isArray(options)) {
    options = options.filter(arg => typeof arg === 'object').pop() || {}
  }

  /** @type {Options & Ext} */
  const output = {}

  for (const key in defaults) {
    if (options[key] !== null && options[key] !== undefined) {
      // @ts-ignore - Unable to infer type of options[key] property ts(2322)
      output[key] = options[key]
    } else {
      // @ts-ignore - Type 'unknown' is not assignable to type '{ parents?: boolean | undefined; long?: boolean | undefined; length?: number | undefined; offset?: number | undefined; }'.ts(2322)
      output[key] = defaults[key]
    }
  }

  // support legacy go arguments
  if (options.count !== undefined) {
    output.length = options.count
  }

  if (options.p !== undefined) {
    output.parents = options.p
  }

  if (options.l !== undefined) {
    output.long = options.l
  }

  if (!output.length && output.length !== 0) {
    output.length = Infinity
  }

  if (output.offset != null && output.offset < 0) {
    throw errCode(new Error('cannot have negative write offset'), 'ERR_INVALID_PARAMS')
  }

  if (output.length < 0) {
    throw errCode(new Error('cannot have negative byte count'), 'ERR_INVALID_PARAMS')
  }

  return output
}
