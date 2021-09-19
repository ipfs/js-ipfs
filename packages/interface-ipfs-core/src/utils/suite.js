/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {object} Skip
 * @property {string} [name]
 * @property {string} [reason]
 */

/**
 * @param {any} o
 * @returns {o is Skip}
 */
const isSkip = (o) => Object.prototype.toString.call(o) === '[object Object]' && (o.name || o.reason)

/**
 * @param {*} tests
 * @param {*} [parent]
 */
export function createSuite (tests, parent) {
  /**
   * @param {Factory} factory
   * @param {object} [options]
   * @param {boolean | Skip | (string | Skip)[]} [options.skip]
   * @param {boolean} [options.only]
   */
  const suite = (factory, options = {}) => {
    Object.keys(tests).forEach(t => {
      const opts = Object.assign({}, options)
      const suiteName = parent ? `${parent}.${t}` : t

      if (Array.isArray(opts.skip)) {
        const skip = opts.skip
          .map((s) => isSkip(s) ? s : { name: s, reason: '🤷' })
          .find((s) => s.name === suiteName)

        if (skip) {
          opts.skip = skip
        }
      }

      if (Array.isArray(opts.only)) {
        if (opts.only.includes(suiteName)) {
          opts.only = true
        }
      }

      tests[t](factory, opts)
    })
  }

  return Object.assign(suite, tests)
}
