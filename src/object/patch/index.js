'use strict'
const { createSuite } = require('../../utils/suite')

const tests = {
  addLink: require('./add-link'),
  rmLink: require('./rm-link'),
  appendData: require('./append-data'),
  setData: require('./set-data')
}

module.exports = createSuite(tests, 'patch')
