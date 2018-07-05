/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

describe.only('ipns', () => {
  if (!isNode) {
    return
  }

  let node
  let ipfsd

  before(function (done) {
    this.timeout(40 * 1000)
    df.spawn({
      exec: IPFS
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      node = _ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('get bootstrap list', (done) => {
    console.log('node', node)
    done()
    // node.bootstrap.list((err, list) => {
    //   expect(err).to.not.exist()
    //   expect(list.Peers).to.deep.equal(defaultList)
    //   done()
    // })
  })
})
