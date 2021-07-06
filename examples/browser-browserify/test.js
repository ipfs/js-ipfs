'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('body')
      .assert.visible('input#file-name')
      .setValue('input#file-name', 'test.txt')
      .assert.visible('input#file-content')
      .setValue('input#file-content', 'test')
      .assert.visible('button#add-submit')
      .click('button#add-submit')
      .waitForElementVisible('#output')
      .waitForElementVisible('#QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm')
      .clearValue('input#file-name')
      .setValue('input#file-name', 'test123.txt')
      .clearValue('input#file-content')
      .setValue('input#file-content', 'test123')
      .click('button#add-submit')
      .waitForElementVisible('#QmSTbSvecWDxM1jPDKBJ2ECBTwwuSAFEyuA111NvMYosr3')

    browser.end()
  }
}
