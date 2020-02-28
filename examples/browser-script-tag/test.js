'use strict'

module.exports = {
  'Browser script tag': function (browser) {
    browser
      .url(process.env.IPFS_EXAMPLE_TEST_URL)
      .executeAsync(function (done) {
        let count = 0
        const interval = setInterval(() => {
          if (count === 10 || window.node) {
            clearInterval(interval)

            done(window.node ? null : 'Did not load node after 10s')
          }

          count++
        }, 1000)
      }, [], (result) => {
        if (result.value) {
          throw new Error(result.value)
        }
      })

    browser.expect.element('#status').text.to.contain('Node status: online')

    browser.end()
  }
}
