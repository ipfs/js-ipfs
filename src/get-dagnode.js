'use strict'

const DAGNode = require('ipld-dag-pb').DAGNode
const parallel = require('async/parallel')
const streamToValue = require('./stream-to-value')

module.exports = function (send, hash, callback) {
  // Retrieve the object and its data in parallel, then produce a DAGNode
  // instance using this information.
  parallel([
    function get (done) {
      send({
        path: 'object/get',
        args: hash
      }, done)
    },

    function data (done) {
      // WORKAROUND: request the object's data separately, since raw bits in JSON
      // are interpreted as UTF-8 and corrupt the data.
      // See https://github.com/ipfs/go-ipfs/issues/1582 for more details.
      send({
        path: 'object/data',
        args: hash
      }, done)
    }],

    function done (err, res) {
      if (err) {
        return callback(err)
      }

      var object = res[0]
      var stream = res[1]

      if (Buffer.isBuffer(stream)) {
        DAGNode.create(stream, object.Links, callback)
      } else {
        streamToValue(stream, (err, data) => {
          if (err) {
            return callback(err)
          }
          DAGNode.create(data, object.Links, callback)
        })
      }
    })
}
