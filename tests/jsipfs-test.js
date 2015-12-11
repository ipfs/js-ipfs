/* globals describe, before, after, it*/

var expect = require('chai').expect
var ncp = require('ncp').ncp
var rimraf = require('rimraf')

// var IPFS = require('../src/ipfs-core')

describe('IPFS Repo Tests', function () {
  var testRepoPath = __dirname + '/test-repo'
  var date = Date.now().toString()
  var repoPath = testRepoPath + date
  var node

  before(function (done) {
    ncp(testRepoPath, repoPath, function (err) {
      if (err) {
        expect(err).to.equal(null)
      }
      done()
    })
  })

  after(function (done) {
    rimraf(repoPath, function (err) {
      if (err) {
        expect(err).to.equal(null)
      }
      done()
    })
  })

  it('start a new node', function (done) {
    process.env.IPFS_PATH = repoPath
    var IPFS = require('../src/ipfs-core')

    node = new IPFS()
    done()
  })

  it('check repo version', function (done) {
    node.repo.version(function (err, version) {
      expect(err).to.equal(null)
      expect(version).to.be.a('string')
      expect(Number(version)).to.be.a('number')
      done()
    })
  })

  it('check id info', function (done) {
    node.id(function (err, id) {
      expect(err).to.equal(null)
      expect(id).to.be.a('object')
      done()
    })
  })
})
