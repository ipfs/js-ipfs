'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementNotVisible('#modal-screen')
      .waitForElementVisible('#log')

    browser.expect.element('#log').text.to.contain('IPFS: Drop some files into this window to get started')

    browser.waitForElementVisible('#button-mkdir')
      .click('#button-mkdir')
      .waitForElementVisible('#form-mkdir-path')
      .clearValue('#form-mkdir-path')
      .setValue('#form-mkdir-path', '/folder')
      .click('#button-form-mkdir-submit')

    browser.expect.element('#files').text.to.contain('folder/')

    browser.click('#button-cp')
      .waitForElementVisible('#form-cp-path')
      .clearValue('#form-cp-path')
      .setValue('#form-cp-path', '/folder')
      .clearValue('#form-cp-dest')
      .setValue('#form-cp-dest', '/folder-copy')
      .click('#button-form-cp-submit')

    browser.expect.element('#files').text.to.contain('folder-copy/')

    browser.click('#button-mv')
      .waitForElementVisible('#form-mv-path')
      .clearValue('#form-mv-path')
      .setValue('#form-mv-path', '/folder')
      .clearValue('#form-mv-dest')
      .setValue('#form-mv-dest', '/folder-other')
      .click('#button-form-mv-submit')

    browser.expect.element('#files').text.to.not.contain('folder/')
    browser.expect.element('#files').text.to.contain('folder-other/')

    browser.end()
  }
}

