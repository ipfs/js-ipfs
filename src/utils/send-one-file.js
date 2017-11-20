'use strict'

const SendOneFileMultipleResults = require('./send-one-file-multiple-results')

module.exports = (send, path) => {
  const sendFile = SendOneFileMultipleResults(send, path)
  return (file, options, callback) => {
    sendFile(file, options, (err, results) => {
      if (err) {
        return callback(err)
      }
      if (results.length !== 1) {
        return callback(new Error('expected 1 result and had ' + results.length))
      }
      callback(null, results[0])
    })
  }
}
