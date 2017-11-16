/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const parallel = require('async/parallel')

const GODaemon = require('../utils/interop-daemon-spawner/go')
const JSDaemon = require('../utils/interop-daemon-spawner/js')

describe('pubsub', () => {
  let jsD
  let goD

  before((done) => {
    goD = new GODaemon()
    jsD = new JSDaemon({ port: 73 })

    parallel([
      (cb) => goD.start(cb),
      (cb) => jsD.start(cb)
    ], done)
  })

  after((done) => {
    series([
      (cb) => goD.stop(cb),
      (cb) => jsD.stop(cb)
    ], done)
  })

  it('make connections', (done) => {
    parallel([
      (cb) => jsD.api.id(cb),
      (cb) => goD.api.id(cb)
    ], (err, ids) => {
      expect(err).to.not.exist()
      parallel([
        (cb) => jsD.api.swarm.connect(ids[1].addresses[0], cb),
        (cb) => goD.api.swarm.connect(ids[0].addresses[0], cb)
      ], done)
    })
  })

  it.skip('publish from JS, subscribe on Go', (done) => {
    // TODO write this test
  })

  it.skip('publish from Go, subscribe on JS', (done) => {
    // TODO write this test
  })
})
