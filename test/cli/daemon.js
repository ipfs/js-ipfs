/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const clean = require('../utils/clean')
const ipfsCmd = require('../utils/ipfs-exec')

describe('daemon', () => {
  let repoPath
  let ipfs

  beforeEach(() => {
    repoPath = '/tmp/ipfs-test-not-found-' + Math.random().toString().substring(2, 8)
    ipfs = ipfsCmd(repoPath)
  })

  afterEach(() => clean(repoPath))

  it(`don't crash if Addresses.Swarm is empty`, (done) => {
    ipfs('init').then(() => {
      return ipfs('config', 'Addresses', JSON.stringify({
        API: ['/ipfs/QmAbc', '/ipfs/QmDef'],
        Gateway: ['/ipfs/QmAbc', '/ipfs/QmDef']
      }), '--json')
    }).then(() => {
      return ipfs('daemon')
    }).then((res) => {
      expect(res).to.have.string('Daemon is ready')
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('gives error if user hasn\'t run init before', (done) => {
    const expectedError = 'no initialized ipfs repo found in ' + repoPath

    ipfs('daemon').catch((err) => {
      expect(err.stdout).to.have.string(expectedError)
      done()
    })
  })
})
