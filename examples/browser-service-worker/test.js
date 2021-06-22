'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: (browser) => {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('body')

    browser.expect.element('body').text.to.contain('Load content by adding IPFS path to the URL')
    browser.expect.element('a').text.to.contain('/ipfs/bafy')

    browser.waitForElementPresent('meta[name=sw-ready]')

    browser
      .url(`${process.env.IPFS_EXAMPLE_TEST_URL}/ipfs/Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD`)
      .waitForElementVisible('body')
      .waitForElementVisible('iframe')

    browser.element('css selector', 'iframe', frame => {
      browser.frame({ ELEMENT: frame.value.ELEMENT }, () => {
        browser.waitForElementPresent('body')
        browser.expect.element('body').text.to.contain('hello world')
        browser.end()
      })
    })
  }
}
