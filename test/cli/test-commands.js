/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('commands', () => {
  it('list the commands', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'commands'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(exitcode).to.equal(0)
        expect(stdout.length).to.equal(56)
        done()
      })
  })
  it('list the commands even if not in the same dir', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'commands'], {cwd: '/tmp'})
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(exitcode).to.equal(0)
        expect(stdout.length).to.equal(56)
        done()
      })
  })
})
