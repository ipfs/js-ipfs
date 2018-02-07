/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const Big = require('big.js')
const { expect } = require('chai')

const isBigInt = (n) => {
  return n.constructor.name === 'Big'
}

module.exports.expectIsBitswap = (err, stats) => {
  expect(err).to.not.exist()
  expect(stats).to.exist()
  expect(stats).to.have.a.property('provideBufLen')
  expect(stats).to.have.a.property('wantlist')
  expect(stats).to.have.a.property('peers')
  expect(stats).to.have.a.property('blocksReceived')
  expect(stats).to.have.a.property('dataReceived')
  expect(stats).to.have.a.property('blocksSent')
  expect(stats).to.have.a.property('dataSent')
  expect(stats).to.have.a.property('dupBlksReceived')
  expect(stats).to.have.a.property('dupDataReceived')

  expect(stats.provideBufLen).to.a('number')
  expect(stats.wantlist).to.be.an('array')
  expect(stats.peers).to.be.an('array')
  expect(isBigInt(stats.blocksReceived)).to.eql(true)
  expect(isBigInt(stats.dataReceived)).to.eql(true)
  expect(isBigInt(stats.blocksSent)).to.eql(true)
  expect(isBigInt(stats.dataSent)).to.eql(true)
  expect(isBigInt(stats.dupBlksReceived)).to.eql(true)
  expect(isBigInt(stats.dupDataReceived)).to.eql(true)
}

module.exports.expectIsBandwidth = (err, stats) => {
  expect(err).to.not.exist()
  expect(stats).to.exist()
  expect(stats).to.have.a.property('totalIn')
  expect(stats).to.have.a.property('totalOut')
  expect(stats).to.have.a.property('rateIn')
  expect(stats).to.have.a.property('rateOut')
  expect(isBigInt(stats.totalIn)).to.eql(true)
  expect(isBigInt(stats.totalOut)).to.eql(true)
  expect(isBigInt(stats.rateIn)).to.eql(true)
  expect(isBigInt(stats.rateOut)).to.eql(true)
}

module.exports.expectIsRepo = (err, res) => {
  expect(err).to.not.exist()
  expect(res).to.exist()
  expect(res).to.have.a.property('numObjects')
  expect(res).to.have.a.property('repoSize')
  expect(res).to.have.a.property('repoPath')
  expect(res).to.have.a.property('version')
  expect(res).to.have.a.property('storageMax')
  expect(isBigInt(res.numObjects)).to.eql(true)
  expect(isBigInt(res.repoSize)).to.eql(true)
  expect(isBigInt(res.storageMax)).to.eql(true)
  expect(res.repoPath).to.be.a('string')
  expect(res.version).to.be.a('string')
}
