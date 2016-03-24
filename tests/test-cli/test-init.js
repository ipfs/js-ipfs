/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')

describe('init', () => {
  it('basic', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('bits', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('empty', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64', '--empty-repo', 'true'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('force', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64', '--force'])
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(exitcode).to.equal(0)

        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64'])
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(1)

            nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64', '--force'])
              .run((err, stdout, exitcode) => {
                expect(err).to.not.exist
                expect(exitcode).to.equal(0)
                done()
              })
          })
      })
  })
})

