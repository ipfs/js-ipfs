/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = ctl => {
  describe('.files', () => {
    describe('.add', () => {
      it.only('performs a speculative add, --only-hash', () => {
        return ctl
          .add(Buffer.from('finding dayz'), { onlyHash: true, progress: false })
          .then(result => {
            console.log('result:', result)
            return ctl.cat(result[0].hash).then(res => {
              console.log('cat (shouldn\'t exist):', String(res))
            })
          })
          .catch(err => {
            console.log('failed to add:', err)
          })
      })
    })
  })
}
