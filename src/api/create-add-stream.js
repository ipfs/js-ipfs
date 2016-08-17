'use strict'

const addCmd = require('./add.js')
const Duplex = require('stream').Duplex
const promisify = require('promisify-es6')

module.exports = (send) => {
  const add = addCmd(send)

  return promisify((callback) => {
    const tuples = []

    const ds = new Duplex({ objectMode: true })
    ds._read = (n) => {}

    ds._write = (file, enc, next) => {
      tuples.push(file)
      next()
    }

    ds.end = () => {
      add(tuples, (err, res) => {
        if (err) {
          return ds.emit('error', err)
        }

        res.forEach((tuple) => {
          ds.push(tuple)
        })

        ds.push(null)
      })
    }
    callback(null, ds)
  })
}
