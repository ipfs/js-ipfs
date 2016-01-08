/* globals describe, it */

'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('cli-offline: version', () => {
  it('get the version', done => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'])
     .expect('0.4.0-dev')
     .run((err, stdout, exitcode) => {
       expect(err).to.not.exist
       expect(exitcode).to.equal(0)
       done()
     })
  })
})
