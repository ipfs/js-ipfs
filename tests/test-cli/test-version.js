/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('version', () => {
  describe('api offline', () => {
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

  describe('api running', () => {
    // TODO
  })
})
