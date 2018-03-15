/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

describe('.files', () => {
  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('.add', function () {
    it('performs a speculative add, --only-hash', () => {
      const content = String(Math.random())

      return ipfs.add(Buffer.from(content), { onlyHash: true })
        .then(files => {
          const getAttempt = ipfs.object.get(files[0].hash)
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
