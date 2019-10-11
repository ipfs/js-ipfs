'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('.ipfs-info')

    browser.expect.element('.ipfs-info h1').text.to.contain('Connected to IPFS')

    browser.end()
  }
}

