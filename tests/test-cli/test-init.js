/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')
const rimraf = require('rimraf')

describe('init', function () {
  this.timeout(10000)

  var oldRepoPath = process.env.IPFS_PATH
  before((done) => {
    oldRepoPath = process.env.IPFS_PATH
    console.log('old', oldRepoPath)
    const repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8) + '/'
    process.env.IPFS_PATH = repoPath
    done()
  })

  after((done) => {
    rimraf(process.env.IPFS_PATH, (err) => {
      expect(err).to.not.exist
      process.env.IPFS_PATH = oldRepoPath
      done()
    })
  })

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

