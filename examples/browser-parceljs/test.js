'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#output')

    browser.expect.element('#output').text.to.contain('The contents of the file was: Hello from parcel.js bundled ipfs example')

    browser.end()
  }
}
