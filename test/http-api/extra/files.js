/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

module.exports = ctl => {
  describe('.files', () => {
    describe('.add', function () {
      it('performs a speculative add, --only-hash', () => {
        const content = String(Math.random() + Date.now())

        return ctl.add(Buffer.from(content), { onlyHash: true })
          .then(files => {
            const getAttempt = ctl.object.get(files[0].hash)
              .then(() => {
                throw new Error('Should not find an object for content added with --only-hash')
              })

            return Promise.race([
              getAttempt,
              new Promise((resolve, reject) => setTimeout(resolve, 4000))
            ])
          })
      })
    })
  })
}
