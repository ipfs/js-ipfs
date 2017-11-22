'use strict'

const SendOneFileMultipleResults = require('./send-one-file-multiple-results')

module.exports = (send, path) => {
  const sendFile = SendOneFileMultipleResults(send, path)
  return (file, options, callback) => {
    sendFile(file, options, (err, results) => {
      if (err) {
        return callback(err)
      }
      callback(null, results[0])
    })
  }
}
