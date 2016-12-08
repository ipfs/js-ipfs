/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const ipfsBase = require('../utils/ipfs-exec')
const ipfs = ipfsBase(repoPath)
const describeOnlineAndOffline = require('../utils/on-and-off')

// The command count bump from 56 to 60 depends on:
// ipfs/interface-ipfs-core.git#5c7df414a8f627f8adb50a52ef8d2b629381285f
// ipfs/js-ipfs-api.git#01044a1f59fb866e4e08b06aae4e74d968615931
const commandCount = 60

describe('commands', () => {
  describeOnlineAndOffline(repoPath, () => {
    it('list the commands', () => {
      return ipfs('commands').then((out) => {
        expect(out.split('\n')).to.have.length(commandCount)
      })
    })
  })

  it('list the commands even if not in the same dir', () => {
    return ipfsBase(repoPath, {
      cwd: '/tmp'
    })('commands').then((out) => {
      expect(out.split('\n').length).to.equal(commandCount)
    })
  })
})
