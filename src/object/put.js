'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')

const SendOneFile = require('../utils/send-one-file')
const once = require('once')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'object/put')

  return promisify((obj, options, _callback) => {
    if (typeof options === 'function') {
      _callback = options
      options = {}
    }

    const callback = once(_callback)

    if (!options) {
      options = {}
    }

    let tmpObj = {
      Data: null,
      Links: []
    }

    if (Buffer.isBuffer(obj)) {
      if (!options.enc) {
        tmpObj = {
          Data: obj.toString(),
          Links: []
        }
      }
    } else if (DAGNode.isDAGNode(obj)) {
      tmpObj = {
        Data: obj.Data.toString(),
        Links: obj.Links.map(l => ({
          Name: l.Name,
          Hash: l.Hash.toString(),
          Size: l.Tsize
        }))
      }
    } else if (typeof obj === 'object') {
      tmpObj.Data = obj.Data.toString()
      tmpObj.Links = obj.Links
    } else {
      return callback(new Error('obj not recognized'))
    }

    let buf
    if (Buffer.isBuffer(obj) && options.enc) {
      buf = obj
    } else {
      buf = Buffer.from(JSON.stringify(tmpObj))
    }
    const enc = options.enc || 'json'

    const sendOptions = {
      qs: { inputenc: enc }
    }

    sendOneFile(buf, sendOptions, (err, result) => {
      if (err) {
        return callback(err) // early
      }

      callback(null, new CID(result.Hash))
    })
  })
}
