'use strict'

module.exports = (send) => {
  return (callback) => {
    return send({
      path: 'commands'
    }, callback)
  }
}
