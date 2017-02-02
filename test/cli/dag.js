/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('dag', () => runOnAndOff((thing) => {
   let ipfs

  before(() => {
    ipfs = thing.ipfs
  })
  
 it('get', () => {
   return ipfs('dag get z43AaGF23fmvRnDP56Ub9WcJCfzSfqtmzNCCvmz5eudT8dtdCDS/parentHash').then((out) => {
     let expectHash = new Buffer('c8c0a17305adea9bbb4b98a52d44f0c1478f5c48fc4b64739ee805242501b256', 'hex')
     expect(out).to.be.eql(expectHash)
   })
 })

}))
