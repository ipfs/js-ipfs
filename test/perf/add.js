/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')
const pull = require('pull-stream')
const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')
const map = require('async/map')

describe('files', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(20 * 1000)

    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = _ipfsd.api
      done()
    })
  })

  after((done) => {
    if (ipfsd) {
      ipfsd.stop(done)
    } else {
      done()
    }
  })

  const displayDuration = (t) => {
    return Math.floor(t / 60000) + 'm' + Math.floor((t % 60000) / 1000) + 's'
  }

  describe('add-perf', () => {
    it('timing', async function () {
      this.timeout(60 * 60 * 1000)

      const batchCount = 30
      const batchSize = 300
      console.log(`Running ${batchCount} batches of size ${batchSize}:`)
      let count = 0
      let sum = 0
      for (let i = 0; i < batchCount; i++) {
        let batchSum = 0
        for (let j = 0; j < batchSize; j++) {
          const start = Date.now()
          const files = await ipfs.add(Buffer.from(hat()))
          batchSum += Date.now() - start
        }
        sum += batchSum
        // console.log('batch sum', displayDuration(batchSum))
        console.log(`batch ${i + 1} avg`, Math.round(batchSum / batchSize) + 'ms')
      }
      console.log('total', displayDuration(sum))
      // console.log('avg  ', Math.round(sum / batchSize * batchCount) + 'ms')
    })
  })
})
