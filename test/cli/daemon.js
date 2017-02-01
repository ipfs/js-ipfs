/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const clean = require('../utils/clean')
const ipfsCmd = require('../utils/ipfs-exec')

describe('daemon', () => {
  let repoPath
  let ipfs

  beforeEach(() => {
    repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)
    ipfs = ipfsCmd(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('gives error if user hasn\'t run init before', (done) => {
    const expectedError = 'no ipfs repo found in ' + repoPath
    ipfs('daemon').catch((err) => {
      expect(err.stdout).to.have.string(expectedError)
      done()
    })
  })
})
