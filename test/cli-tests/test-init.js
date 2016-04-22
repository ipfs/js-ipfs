/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const clean = require('../utils/clean')

describe('init', function () {
  this.timeout(10000)
  const env = _.clone(process.env)
  const repoExistsSync = (p) => (
    fs.existsSync(path.join(env.IPFS_PATH, p))
  )

  beforeEach(() => {
    env.IPFS_PATH = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)
  })

  afterEach(() => {
    clean(env.IPFS_PATH)
  })

  it('basic', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init'], {env})
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(repoExistsSync('blocks')).to.equal(true)
        expect(repoExistsSync('config')).to.equal(true)
        expect(repoExistsSync('version')).to.equal(true)
        done()
      })
  })

  it('bits', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64'], {env})
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('empty', (done) => {
    nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'init', '--bits', '64', '--empty-repo', 'true'], {env})
      .run((err, stdout, exitcode) => {
        expect(err).to.not.exist
        expect(repoExistsSync('blocks')).to.equal(false)
        expect(repoExistsSync('config')).to.equal(true)
        expect(repoExistsSync('version')).to.equal(true)
        done()
      })
  })
})
