'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('[data-test=title]')
      .assert.containsText('[data-test=title]', 'Connected to IPFS')
      .assert.elementPresent('[data-test=id')
      .assert.elementPresent('[data-test=agentVersion')
      .end()
  }
}

