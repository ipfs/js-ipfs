'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#ipfs')

    browser.expect.element('#ipfs-status').text.to.contain('Online')

    browser.end()
  }
}
