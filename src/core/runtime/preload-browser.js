const debug = require('debug')

const log = debug('jsipfs:preload')
log.error = debug('jsipfs:preload:error')

module.exports = function preload (url, callback) {
  log(url)

  const req = new window.XMLHttpRequest()

  req.open('HEAD', url)

  req.onreadystatechange = function () {
    if (this.readyState !== this.DONE) {
      return
    }

    if (this.status !== 200) {
      log.error('failed to preload', url, this.status, this.statusText)
      return callback(new Error(`failed to preload ${url}`))
    }

    callback()
  }

  req.send()
}
