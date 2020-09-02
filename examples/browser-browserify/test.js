'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#source')
      .setValue('#source', 'hello')
      .waitForElementVisible('#store')
      .click('#store')
      .waitForElementVisible('#output', 5e3, 100)

    browser.expect.element('#cid').text.to.contain('QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX')
    browser.expect.element('#content').text.to.contain('hello')

    browser.end()
  }
}
