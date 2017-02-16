/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const path = require('path')

const FactoryClient = require('./ipfs-factory/client')

describe('.add (extra tests)', () => {
  if (!isNode) { return }

  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      ipfs = node
      done()
    })
  })

  after((done) => fc.dismantle(done))

  it('add file for testing', (done) => {
    const validPath = path.join(process.cwd() + '/package.json')

    ipfs.files.add(validPath, (err, res) => {
      expect(err).to.exist
      done()
    })
  })
})
