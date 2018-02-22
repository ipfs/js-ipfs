/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = ctl => {
  describe('.files', () => {
    describe('.add', function () {
      it('performs a speculative add, --only-hash', () => {
        const content = String(Math.random() + Date.now())

        return ctl
          .add(Buffer.from(content), { onlyHash: true })
          .then(files => {
            const getAttempt = ctl.object.get(files[0].hash)
              .then(() => {
                throw new Error('Should not find an object for content added with --only-hash')
              })

            return Promise.race([
              getAttempt,
              new Promise(res => setTimeout(res, 4000))
            ])
          })
      })
    })
  })
}
