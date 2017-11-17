'use strict'

const addCmd = require('./add.js')
const Duplex = require('readable-stream').Duplex

module.exports = (send) => {
  const add = addCmd(send)

  return (options) => {
    options = options || {}

    const tuples = []

    const ds = new Duplex({ objectMode: true })
    ds._read = (n) => {}

    ds._write = (file, enc, next) => {
      tuples.push(file)
      next()
    }

    ds.end = () => add(tuples, options, (err, res) => {
      if (err) { return ds.emit('error', err) }

      res.forEach((tuple) => ds.push(tuple))
      ds.push(null)
    })

    return ds
  }
}
