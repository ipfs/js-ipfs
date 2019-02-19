'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  cancel: require('./cancel'),
  state: require('./state'),
  subs: require('./subs')
}

module.exports = createSuite(tests)
