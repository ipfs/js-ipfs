/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const clean = require('../utils/clean')
const hat = require('hat')
const ipfsExec = require('../utils/ipfs-exec')
const os = require('os')

describe('init', function () {
  this.timeout(40 * 1000)

  let repoPath
  let ipfs

  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
    .toString('utf-8')

  const repoExistsSync = (p) => fs.existsSync(path.join(repoPath, p))

  const repoDirSync = (p) => {
    return fs.readdirSync(path.join(repoPath, p)).filter((f) => {
      return !f.startsWith('.')
    })
  }
  beforeEach(() => {
    repoPath = os.tmpdir() + '/ipfs-' + hat()
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('basic', function () {
    this.timeout(40 * 1000)

    return ipfs('init').then((out) => {
      expect(repoDirSync('blocks')).to.have.length.above(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)

      // Test that the following was written when init-ing the repo
      // jsipfs files cat /ipfs/QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr/readme
      let command = out.substring(out.indexOf('cat'), out.length - 2 /* omit the newline char */)
      return ipfs(command)
    }).then((out) => expect(out).to.equal(readme))
  })

  it('bits', function () {
    this.timeout(40 * 1000)

    return ipfs('init --bits 1024').then(() => {
      expect(repoDirSync('blocks')).to.have.length.above(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('empty', function () {
    this.timeout(40 * 1000)

    return ipfs('init --bits 1024 --empty-repo true').then(() => {
      expect(repoDirSync('blocks')).to.have.length(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('should present ipfs path help when option help is received', function (done) {
    this.timeout(100 * 1000)

    ipfs('init --help').then((res) => {
      expect(res).to.have.string('export IPFS_PATH=/path/to/ipfsrepo')
      done()
    })
  })
})
