/* eslint-env mocha */
const fs = require('fs')

describe('multipart', () => {
  var tests = fs.readdirSync(__dirname)
  tests
    .filter((file) => file !== 'fixtures' && file !== 'index.js')
    .forEach((file) => {
      require('./' + file)
    })
})
