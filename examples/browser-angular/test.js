'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#ipfs-info')

    browser.expect.element('#ipfs-info-id').to.be.present
    browser.expect.element('#ipfs-info-version').to.be.present
    browser.expect.element('#ipfs-info-status').text.to.contain('Online')
    browser.end()
  }
}
