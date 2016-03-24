/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')
const utils = require('../../src/cli/utils')

function repoExistsSync (p) {
  return fs.existsSync(path.join(utils.getRepoPath(), p))
}

describe('init', function () {
  this.timeout(10000)

  var oldRepoPath = process.env.IPFS_PATH
  beforeEach((done) => {
    oldRepoPath = process.env.IPFS_PATH
    const repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8) + '/'
    process.env.IPFS_PATH = repoPath
    done()
  })

  afterEach((done) => {
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
        expect(repoExistsSync('blocks')).to.equal(true)
        expect(repoExistsSync('config')).to.equal(true)
        expect(repoExistsSync('version')).to.equal(true)
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
        expect(repoExistsSync('blocks')).to.equal(false)
        expect(repoExistsSync('config')).to.equal(true)
        expect(repoExistsSync('version')).to.equal(true)
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

