'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#source')
      .setValue('#source', 'hello')
      .waitForElementVisible('#store')
      .pause(1000)
      .click('#store')
      .waitForElementVisible('#output')
      .assert.containsText('#hash', 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX')
      .assert.containsText('#content', 'hello')
      .end()
  }
}
