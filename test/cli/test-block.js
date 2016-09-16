/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const describeOnlineAndOffline = require('../utils/on-and-off')
const ipfs = require('../utils/ipfs')(repoPath)

describe('block', () => {
  describeOnlineAndOffline(repoPath, () => {
    it('put', () => {
      return ipfs('block put test/test-data/hello').then((out) => {
        expect(out).to.be.eql(
          'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        )
      })
    })

    it('get', () => {
      return ipfs('block get QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp').then((out) => {
        expect(out).to.be.eql('hello world\n')
      })
    })

    it('stat', () => {
      return ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp').then((out) => {
        expect(out).to.be.eql([
          'Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          'Size: 12'
        ].join('\n'))
      })
    })

    it.skip('rm', () => {
      return ipfs('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp').then((out) => {
        expect(out).to.be.eql(
          'removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        )
      })
    })
  })
})
