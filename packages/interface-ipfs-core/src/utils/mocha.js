/* eslint-env mocha */

/**
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
 * Get a "describe" function that is optionally 'skipped' or 'onlyed'
 * If skip/only are boolean true, or an object with a reason property, then we
 * want to skip/only the whole suite
 *
 * @param {object} [config]
 * @param {boolean | Skip | (string | Skip)[]} [config.skip]
 * @param {boolean} [config.only]
 */
export function getDescribe (config) {
  if (config) {
    if (config.skip === true) {
      return describe.skip
    }

    if (config.only === true) {
      return describe.only // eslint-disable-line
    }

    if (Array.isArray(config.skip)) {
      const skipArr = config.skip

      /**
       * @param {string} name
       * @param {*} impl
       */
      const _describe = (name, impl) => {
        const skip = skipArr.find(skip => {
          if (typeof skip === 'string') {
            return skip === name
          }

          return skip.name === name
        })

        if (skip) {
          return describe.skip(`${name} (${typeof skip === 'string' ? '🤷' : skip.reason})`, impl)
        }

        describe(name, impl)
      }

      _describe.skip = describe.skip
      _describe.only = describe.only // eslint-disable-line

      return _describe
    } else if (isSkip(config.skip)) {
      const skip = config.skip

      if (!skip.reason) {
        return describe.skip
      }

      /**
       * @param {string} name
       * @param {*} impl
       */
      const _describe = (name, impl) => {
        describe.skip(`${name} (${skip.reason})`, impl)
      }

      _describe.skip = describe.skip
      _describe.only = describe.only // eslint-disable-line

      return _describe
    }
  }

  return describe
}

/**
 * Get an "it" function that is optionally 'skipped' or 'onlyed'
 * If skip/only is an array, then we _might_ want to skip/only the specific
 * test if one of the items in the array is the same as the test name or if one
 * of the items in the array is an object with a name property that is the same
 * as the test name.
 *
 * @param {object} [config]
 * @param {boolean | Skip | (string | Skip)[]} [config.skip]
 * @param {boolean} [config.only]
 */
export function getIt (config) {
  if (!config) return it

  /**
   * @param {string} name
   * @param {*} impl
   * @returns
   */
  const _it = (name, impl) => {
    if (Array.isArray(config.skip)) {
      const skip = config.skip
        .map((s) => isSkip(s) ? s : { name: s, reason: '🤷' })
        .find((s) => s.name === name)

      if (skip) {
        if (skip.reason) name = `${name} (${skip.reason})`
        return it.skip(name, impl)
      }
    }

    if (Array.isArray(config.only)) {
      const only = config.only
        .map((o) => isSkip(o) ? o : { name: o, reason: '🤷' })
        .find((o) => o.name === name)

      if (only) {
        if (only.reason) name = `${name} (${only.reason})`
        return it.only(name, impl) // eslint-disable-line no-only-tests/no-only-tests
      }
    }

    it(name, impl)
  }

  _it.skip = it.skip
  _it.only = it.only // eslint-disable-line no-only-tests/no-only-tests

  return _it
}
