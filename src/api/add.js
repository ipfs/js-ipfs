const Wreck = require('wreck')

module.exports = send => {
  return function add (files, opts, cb) {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    if (typeof files === 'string' && files.startsWith('http')) {
      Wreck.request('GET', files, null, (err, res) => {
        if (err) return cb(err)

        send('add', null, opts, res, cb)
      })

      return
    }

    send('add', null, opts, files, cb)
  }
}
