/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const ipfsBase = require('../utils/ipfs-exec')
const runOnAndOff = require('../utils/on-and-off')

const commandCount = 61

describe('commands', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('list the commands', () => {
    return ipfs('commands').then((out) => {
      expect(out.split('\n')).to.have.length(commandCount)
    })
  })
}))
