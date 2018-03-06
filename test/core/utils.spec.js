/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihashes = require('multihashes')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')
const IPFS = require('../../src/core')
const utils = require('../../src/core/utils')

describe('utils', () => {
  const rootHashString = 'QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU'
  const rootHash = multihashes.fromB58String(rootHashString)
  const rootPathString = `/ipfs/${rootHashString}/`
  const aboutHashString = 'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V'
  const aboutHash = multihashes.fromB58String(aboutHashString)
  const aboutPathString = `/ipfs/${rootHashString}/about`

  describe('parseIpfsPath', () => {
    it('parses path with no links', function () {
      expect(utils.parseIpfsPath(rootHashString))
        .to.deep.equal({
          root: rootHashString,
          links: []
        })
    })

    it('parses path with links', function () {
      expect(utils.parseIpfsPath(`${rootHashString}/docs/index`))
        .to.deep.equal({
          root: rootHashString,
          links: ['docs', 'index']
        })
    })

    it('parses path with /ipfs/ prefix', function () {
      expect(utils.parseIpfsPath(`/ipfs/${rootHashString}/about`))
        .to.deep.equal({
          root: rootHashString,
          links: ['about']
        })
    })

    it('returns error for malformed path', function () {
      const result = utils.parseIpfsPath(`${rootHashString}//about`)
      expect(result.error).to.be.instanceof(Error)
        .and.have.property('message', 'invalid ipfs ref path')
    })

    it('returns error if root is not a valid CID', function () {
      const result = utils.parseIpfsPath('invalid/ipfs/path')
      expect(result.error).to.be.instanceof(Error)
        .and.have.property('message', 'invalid ipfs ref path')
    })
  })

  describe('normalizeHashes', function () {
    this.timeout(80 * 1000)
    let node
    let repo

    before((done) => {
      repo = createTempRepo()
      node = new IPFS({
        repo: repo
      })
      node.once('ready', done)
    })

    after((done) => {
      repo.teardown(done)
    })

    it('normalizes hash string to array with multihash object', (done) => {
      utils.normalizeHashes(node, rootHashString, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(rootHash)
        done()
      })
    })

    it('normalizes array of hash strings to array of multihash objects', (done) => {
      utils.normalizeHashes(node, [rootHashString, aboutHashString], (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(2)
        expect(hashes[0]).to.deep.equal(rootHash)
        expect(hashes[1]).to.deep.equal(aboutHash)
        done()
      })
    })

    it('normalizes multihash object to array with multihash object', (done) => {
      utils.normalizeHashes(node, aboutHash, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(aboutHash)
        done()
      })
    })

    it('normalizes array of multihash objects to array of multihash objects', (done) => {
      utils.normalizeHashes(node, [rootHash, aboutHash], (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(2)
        expect(hashes[0]).to.deep.equal(rootHash)
        expect(hashes[1]).to.deep.equal(aboutHash)
        done()
      })
    })

    it('normalizes ipfs path string to array with multihash object', (done) => {
      utils.normalizeHashes(node, aboutPathString, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(aboutHash)
        done()
      })
    })

    it('normalizes array of ipfs path strings to array with multihash objects', (done) => {
      utils.normalizeHashes(node, [aboutPathString, rootPathString], (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(2)
        expect(hashes[0]).to.deep.equal(aboutHash)
        expect(hashes[1]).to.deep.equal(rootHash)
        done()
      })
    })
  })
})
