'use strict'

const addCmd = require('./add.js')
const pull = require('pull-stream')
const pushable = require('pull-pushable')

module.exports = (send) => {
  const add = addCmd(send)

  return (options) => {
    options = options || {}

    const source = pushable()
    const sink = pull.collect((err, tuples) => {
      if (err) { return source.end(err) }

      add(tuples, options, (err, filesAdded) => {
        if (err) { return source.end(err) }

        filesAdded.forEach((file) => source.push(file))
        source.end()
      })
    })

    return {
      sink: sink,
      source: source
    }
  }
}
