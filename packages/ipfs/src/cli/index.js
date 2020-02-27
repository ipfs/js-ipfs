'use strict'

const parser = require('./parser')
const commandAlias = require('./command-alias')
const errCode = require('err-code')

module.exports = (command, ctxMiddleware) => {
  // Apply command aliasing (eg `refs local` -> `refs-local`)
  command = commandAlias(command)

  return new Promise((resolve, reject) => {
    try {
      parser
        .middleware(ctxMiddleware)
        .onFinishCommand((data) => {
          resolve(data)
        })
        .fail((msg, err, yargs) => {
          // Handle yargs errors
          if (msg) {
            return reject(errCode(new Error(msg), 'ERR_YARGS', { yargs }))
          }

          reject(err)
        })
        .parse(command)
    } catch (err) {
      return reject(err)
    }
  })
}
