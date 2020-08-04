'use strict'

const pkg = require('./package.json')

module.exports = {
  [pkg.name]: (browser) => {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('.ipfs-add')

    browser.expect.element('.ipfs-add a').text.to.contain('/ipfs/')
    browser.click('.ipfs-add a')

    browser.windowHandle(({ value }) => {
      browser.windowHandles(({ value: handles }) => {
        const [handle] = handles.filter(handle => handle != value)
        browser.switchWindow(handle)
      })
    })

    browser.waitForElementVisible('.loading')
    browser.expect.element('.loading').text.to.contain('Loading /ipfs/')

    browser.waitForElementVisible('#content').pause(5000)
    browser.element('css selector', '#content', frame => {
      browser.frame({ ELEMENT: frame.value.ELEMENT }, () => {
        browser.waitForElementPresent('body')
        browser.expect.element('body').text.to.contain('hello world!')
        browser.end()
      })
    })
  }
}
