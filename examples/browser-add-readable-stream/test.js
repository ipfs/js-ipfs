'use strict'

module.exports = {
  'Add readable stream example': function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementVisible('body')
      .assert.visible('input#file-directory')
      .assert.visible('input#file-name')
      .setValue('input#file-name', 'test.txt')
      .assert.visible('input#file-content')
      .setValue('input#file-content', 'test')
      .assert.visible('button#add-submit')
      .click('button#add-submit')
      .waitForElementVisible('#content')

    browser.expect.elements('#content > *').count.to.equal(4)

    browser.end()
  }
}
