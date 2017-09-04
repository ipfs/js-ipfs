'use strict'

const factoryServer = require('./server')

let factory

module.exports = {
  start (done) {
    factoryServer((err, http) => {
      if (err) {
        return done(err)
      }
      factory = http
      done()
    })
  },
  stop (done) {
    factory.stop({
      timeout: 1
    }, done)
  }
}
