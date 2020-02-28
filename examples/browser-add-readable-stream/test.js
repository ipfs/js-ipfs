'use strict'

module.exports = {
  'Add readable stream example': function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('#output')

    browser.expect.element('#output').text.to.contain('directory/ QmVgJePRxp1vhRxDcJWdmuFGfUB5S5RYTtG1NR3bQM4BBn')

    browser.end()
  }
}
