/* globals describe, it */

var expect = require('chai').expect
var nexpect = require('nexpect')

describe('cli-offline: version', function () {
  it('get the version', function (done) {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'])
     .expect('0.4.0-dev')
     .run(function (err, stdout, exitcode) {
       expect(err).to.not.exist
       expect(exitcode).to.equal(0)
       done()
     })
  })
})
