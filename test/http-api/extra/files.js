/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

function resolveIn(ms) {
  return new Promise(res => setTimeout(res, ms))
}

module.exports = ctl => {
  describe('.files', () => {
    describe('.add', function () {
      it.only('performs a speculative add, --only-hash', () => {
        return ctl
          .add(Buffer.from('Hola, Mundo'), { onlyHash: true })
          .then(result => {
            const lsAttempt = ctl.ls(result[0].hash)
              .then(() => {
                throw new Error('ls should not find a result for a file added with --only-hash')
              })
            return Promise.race([
              lsAttempt,
              new Promise(res => setTimeout(res, 4000))
            ])
          })
      })
    })
  })
}
