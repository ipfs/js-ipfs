'use strict'

const createAdd = require('../../components-ipfsx/add')

module.exports = function (self) {
  const {
    _ipld: ipld,
    dag,
    _gcLock: gcLock,
    _preload: preload,
    pin,
    _options: config
  } = self

  const add = createAdd({ ipld, dag, gcLock, preload, pin, config })

  return async function * addAsyncIterator (source, options) {
    options = options || {}

    for await (const file of add(source, options)) {
      yield { hash: file.cid.toString(), ...file }
    }
  }
}
