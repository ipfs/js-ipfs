/* eslint-env mocha */
'use strict'

const chai = require('chai')

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(require('chai-as-promised'))
chai.use(require('dirty-chai'))
chai.use(require('chai-things'))

module.exports.expect = chai.expect

const isObject = (o) => Object.prototype.toString.call(o) === '[object Object]'

// Get a "describe" function that is optionally 'skipped' or 'onlyed'
// If skip/only are boolean true, or an object with a reason property, then we
// want to skip/only the whole suite
function getDescribe (config) {
  if (config) {
    if (config.skip === true) return describe.skip

    if (isObject(config.skip)) {
      if (!config.skip.reason) return describe.skip

      const _describe = (name, impl) => {
        describe.skip(`${name} (${config.skip.reason})`, impl)
      }

      _describe.skip = describe.skip
      _describe.only = describe.only // eslint-disable-line

      return _describe
    }

    if (config.only === true) return describe.only  // eslint-disable-line
  }

  return describe
}

module.exports.getDescribe = getDescribe

// Get an "it" function that is optionally 'skipped' or 'onlyed'
// If skip/only is an array, then we _might_ want to skip/only the specific
// test if one of the items in the array is the same as the test name or if one
// of the items in the array is an object with a name property that is the same
// as the test name.
function getIt (config) {
  if (!config) return it

  const _it = (name, impl) => {
    if (Array.isArray(config.skip)) {
      const skip = config.skip
        .map((s) => isObject(s) ? s : { name: s })
        .find((s) => s.name === name)

      if (skip) {
        if (skip.reason) name = `${name} (${skip.reason})`
        return it.skip(name, impl)
      }
    }

    if (Array.isArray(config.only)) {
      const only = config.only
        .map((o) => isObject(o) ? o : { name: o })
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

module.exports.getIt = getIt
