'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((callback) => {
    send({ path: 'shutdown' }, callback)
  })
}
