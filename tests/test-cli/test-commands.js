/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('commands', () => {
  it('list the commands', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'commands'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(exitcode).to.equal(0)
        expect(stdout.length).to.equal(32)
        done()
      })
  })
})
