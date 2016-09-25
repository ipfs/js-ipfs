/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const describeOnlineAndOffline = require('../utils/on-and-off')
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe('id', () => {
  describeOnlineAndOffline(repoPath, () => {
    it('get the id', () => {
      return ipfs('id').then((res) => {
        const id = JSON.parse(res)
        expect(id).to.have.property('id')
        expect(id).to.have.property('publicKey')
        expect(id).to.have.property('addresses')
      })
    })
  })
})
