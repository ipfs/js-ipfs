'use strict'

module.exports = {
  'Browser video streaming': function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .waitForElementPresent('#video')
      .executeAsync(function (done) {
        const video = document.getElementById('video')
        video.addEventListener('canplay', function () {
          done()
        })

        setTimeout(() => {
          done('Did not start streaming video after 1m')
        }, 60000)
      }, [], (result) => {
        if (result.value) {
          throw new Error(result.value)
        }
      })

    browser.end()
  }
}
