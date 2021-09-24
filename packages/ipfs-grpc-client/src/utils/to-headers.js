import { paramCase } from 'change-case'

/**
 * @param {Record<string, any>} [object] - key/value pairs to turn into HTTP headers
 */
export function toHeaders (object = {}) {
  /** @type {Record<string, string>} */
  const output = {}

  Object.keys(object || {}).forEach(key => {
    if (typeof object[key] === 'function') {
      return
    }

    output[paramCase(key)] = object[key].toString()
  })

  return output
}
