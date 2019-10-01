/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')

const {
  DAGNode
} = require('ipld-dag-pb')
const CID = require('cids')
const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-nodejs')
const expectTimeout = require('../utils/expect-timeout')

// fixture structure:
//  planets/
//   solar-system.md
//   mercury/
//    wiki.md
const pins = {
  root: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys',
  solarWiki: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG',
  mercuryDir: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q',
  mercuryWiki: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi'
}
const pinTypes = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

describe('pin', function () {
  const fixtures = [
    'test/fixtures/planets/mercury/wiki.md',
    'test/fixtures/planets/solar-system.md'
  ].map(path => ({
    path,
    content: fs.readFileSync(path)
  }))

  let ipfs
  let pin
  let repo

  function expectPinned (hash, type = pinTypes.all, pinned = true) {
    if (typeof type === 'boolean') {
      pinned = type
      type = pinTypes.all
    }

    return pin.pinManager.isPinnedWithType(hash, type)
      .then(result => {
        expect(result.pinned).to.eql(pinned)
        if (type === pinTypes.indirect) {
          // indirect pins return a CID of recursively pinned root instead of 'indirect' string
          expect(CID.isCID(result.reason)).to.be.true()
        } else if (type !== pinTypes.all) {
          expect(result.reason).to.eql(type)
        }
      })
  }

  async function clearPins () {
    let ls = (await pin.ls()).filter(out => out.type === pinTypes.recursive)

    for (let i = 0; i < ls.length; i++) {
      await pin.rm(ls[i].hash)
    }

    ls = (await pin.ls()).filter(out => out.type === pinTypes.direct)

    for (let i = 0; i < ls.length; i++) {
      await pin.rm(ls[i].hash)
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    repo = createTempRepo()
    ipfs = new IPFS({
      repo,
      config: {
        Bootstrap: []
      },
      preload: { enabled: false }
    })
    ipfs.on('ready', () => {
      pin = ipfs.pin
      ipfs.add(fixtures, done)
    })
  })

  after(function (done) {
    this.timeout(60 * 1000)
    ipfs.stop(done)
  })

  after((done) => repo.teardown(done))

  describe('isPinnedWithType', function () {
    beforeEach(function () {
      return clearPins()
        .then(() => pin.add(pins.root))
    })

    it('when node is pinned', function () {
      return pin.add(pins.solarWiki)
        .then(() => pin.pinManager.isPinnedWithType(pins.solarWiki, pinTypes.all))
        .then(pinned => expect(pinned.pinned).to.eql(true))
    })

    it('when node is not in datastore', function () {
      const falseHash = `${pins.root.slice(0, -2)}ss`
      return pin.pinManager.isPinnedWithType(falseHash, pinTypes.all)
        .then(pinned => {
          expect(pinned.pinned).to.eql(false)
          expect(pinned.reason).to.eql(undefined)
        })
    })

    it('when node is in datastore but not pinned', function () {
      return pin.rm(pins.root)
        .then(() => expectPinned(pins.root, false))
    })

    it('when pinned recursively', function () {
      return pin.pinManager.isPinnedWithType(pins.root, pinTypes.recursive)
        .then(result => {
          expect(result.pinned).to.eql(true)
          expect(result.reason).to.eql(pinTypes.recursive)
        })
    })

    it('when pinned indirectly', function () {
      return pin.pinManager.isPinnedWithType(pins.mercuryWiki, pinTypes.indirect)
        .then(result => {
          expect(result.pinned).to.eql(true)
          expect(result.reason.toBaseEncodedString()).to.eql(pins.root)
        })
    })

    it('when pinned directly', function () {
      return pin.add(pins.mercuryDir, { recursive: false })
        .then(() => {
          return pin.pinManager.isPinnedWithType(pins.mercuryDir, pinTypes.direct)
            .then(result => {
              expect(result.pinned).to.eql(true)
              expect(result.reason).to.eql(pinTypes.direct)
            })
        })
    })

    it('when not pinned', function () {
      return clearPins()
        .then(() => pin.pinManager.isPinnedWithType(pins.mercuryDir, pinTypes.direct))
        .then(pin => expect(pin.pinned).to.eql(false))
    })
  })

  describe('add', function () {
    beforeEach(function () {
      return clearPins()
    })

    it('recursive', function () {
      return pin.add(pins.root)
        .then(() => {
          expectPinned(pins.root, pinTypes.recursive)
          const pinChecks = Object.values(pins)
            .map(hash => expectPinned(hash))

          return Promise.all(pinChecks)
        })
    })

    it('direct', function () {
      return pin.add(pins.root, { recursive: false })
        .then(() => Promise.all([
          expectPinned(pins.root, pinTypes.direct),
          expectPinned(pins.solarWiki, false)
        ]))
    })

    it('recursive pin parent of direct pin', function () {
      return pin.add(pins.solarWiki, { recursive: false })
        .then(() => pin.add(pins.root))
        .then(() => Promise.all([
          // solarWiki is pinned both directly and indirectly o.O
          expectPinned(pins.solarWiki, pinTypes.direct),
          expectPinned(pins.solarWiki, pinTypes.indirect)
        ]))
    })

    it('directly pinning a recursive pin fails', function () {
      return pin.add(pins.root)
        .then(() => pin.add(pins.root, { recursive: false }))
        .catch(err => expect(err).to.match(/already pinned recursively/))
    })

    it('can\'t pin item not in datastore', function () {
      this.timeout(5 * 1000)
      const falseHash = `${pins.root.slice(0, -2)}ss`
      return expectTimeout(pin.add(falseHash), 4000)
    })

    // TODO block rm breaks subsequent tests
    it.skip('needs all children in datastore to pin recursively', () => {
      return ipfs.block.rm(pins.mercuryWiki)
        .then(() => expectTimeout(pin.add(pins.root), 4000))
    })
  })

  describe('ls', function () {
    before(function () {
      return clearPins()
        .then(() => Promise.all([
          pin.add(pins.root),
          pin.add(pins.mercuryDir, { recursive: false })
        ]))
    })

    it('lists pins of a particular hash', function () {
      return pin.ls(pins.mercuryDir)
        .then(out => expect(out[0].hash).to.eql(pins.mercuryDir))
    })

    it('indirect pins supersedes direct pins', function () {
      return pin.ls()
        .then(ls => {
          const pinType = ls.find(out => out.hash === pins.mercuryDir).type
          expect(pinType).to.eql(pinTypes.indirect)
        })
    })

    describe('list pins of type', function () {
      it('all', function () {
        return pin.ls()
          .then(out =>
            expect(out).to.deep.include.members([
              {
                type: 'recursive',
                hash: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys'
              },
              {
                type: 'indirect',
                hash: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG'
              },
              {
                type: 'indirect',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'
              },
              {
                type: 'indirect',
                hash: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi'
              }
            ])
          )
      })

      it('all direct', function () {
        return pin.ls({ type: 'direct' })
          .then(out =>
            expect(out).to.deep.include.members([
              {
                type: 'direct',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'
              }
            ])
          )
      })

      it('all recursive', function () {
        return pin.ls({ type: 'recursive' })
          .then(out =>
            expect(out).to.deep.include.members([
              {
                type: 'recursive',
                hash: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys'
              }
            ])
          )
      })

      it('all indirect', function () {
        return pin.ls({ type: 'indirect' })
          .then(out =>
            expect(out).to.deep.include.members([
              {
                type: 'indirect',
                hash: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG'
              },
              {
                type: 'indirect',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'
              },
              {
                type: 'indirect',
                hash: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi'
              }
            ])
          )
      })

      it('direct for CID', function () {
        return pin.ls(pins.mercuryDir, { type: 'direct' })
          .then(out =>
            expect(out).to.have.deep.members([
              {
                type: 'direct',
                hash: pins.mercuryDir
              }
            ])
          )
      })

      it('direct for path', function () {
        return pin.ls(`/ipfs/${pins.root}/mercury/`, { type: 'direct' })
          .then(out =>
            expect(out).to.have.deep.members([
              {
                type: 'direct',
                hash: pins.mercuryDir
              }
            ])
          )
      })

      it('direct for path (no match)', function (done) {
        pin.ls(`/ipfs/${pins.root}/mercury/wiki.md`, { type: 'direct' }, (err, pinset) => {
          expect(err).to.exist()
          expect(pinset).to.not.exist()
          done()
        })
      })

      it('direct for CID (no match)', function (done) {
        pin.ls(pins.root, { type: 'direct' }, (err, pinset) => {
          expect(err).to.exist()
          expect(pinset).to.not.exist()
          done()
        })
      })

      it('recursive for CID', function () {
        return pin.ls(pins.root, { type: 'recursive' })
          .then(out =>
            expect(out).to.have.deep.members([
              {
                type: 'recursive',
                hash: pins.root
              }
            ])
          )
      })

      it('recursive for CID (no match)', function (done) {
        return pin.ls(pins.mercuryDir, { type: 'recursive' }, (err, pinset) => {
          expect(err).to.exist()
          expect(pinset).to.not.exist()
          done()
        })
      })

      it('indirect for CID', function () {
        return pin.ls(pins.solarWiki, { type: 'indirect' })
          .then(out =>
            expect(out).to.have.deep.members([
              {
                type: `indirect through ${pins.root}`,
                hash: pins.solarWiki
              }
            ])
          )
      })

      it('indirect for CID (no match)', function (done) {
        pin.ls(pins.root, { type: 'indirect' }, (err, pinset) => {
          expect(err).to.exist()
          expect(pinset).to.not.exist()
          done()
        })
      })
    })
  })

  describe('rm', function () {
    beforeEach(function () {
      return clearPins()
        .then(() => pin.add(pins.root))
    })

    it('a recursive pin', function () {
      return pin.rm(pins.root)
        .then(() => {
          return Promise.all([
            expectPinned(pins.root, false),
            expectPinned(pins.mercuryWiki, false)
          ])
        })
    })

    it('a direct pin', function () {
      return clearPins()
        .then(() => pin.add(pins.mercuryDir, { recursive: false }))
        .then(() => pin.rm(pins.mercuryDir))
        .then(() => expectPinned(pins.mercuryDir, false))
    })

    it('fails to remove an indirect pin', function () {
      return pin.rm(pins.solarWiki)
        .catch(err => expect(err).to.match(/is pinned indirectly under/))
        .then(() => expectPinned(pins.solarWiki))
    })

    it('fails when an item is not pinned', function () {
      return pin.rm(pins.root)
        .then(() => pin.rm(pins.root))
        .catch(err => expect(err).to.match(/is not pinned/))
    })
  })

  describe('flush', function () {
    beforeEach(function () {
      return pin.add(pins.root)
    })

    it('flushes', function () {
      return pin.ls()
        .then(ls => expect(ls.length).to.eql(4))
        .then(() => {
          // indirectly trigger a datastore flush by adding something
          return clearPins()
            .then(() => pin.add(pins.mercuryWiki))
        })
        .then(() => pin.pinManager.load())
        .then(() => pin.ls())
        .then(ls => expect(ls.length).to.eql(1))
    })
  })

  describe('non-dag-pb nodes', function () {
    it('pins dag-cbor', async () => {
      const cid = await ipfs.dag.put({}, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      await pin.add(cid)

      const pins = await pin.ls()

      expect(pins).to.deep.include({
        type: 'recursive',
        hash: cid.toString()
      })
    })

    it('pins raw', async () => {
      const cid = await ipfs.dag.put(Buffer.alloc(0), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      await pin.add(cid)

      const pins = await pin.ls()

      expect(pins).to.deep.include({
        type: 'recursive',
        hash: cid.toString()
      })
    })

    it('pins dag-cbor with dag-pb child', async () => {
      const child = await ipfs.dag.put(new DAGNode(Buffer.alloc(0)), {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })
      const parent = await ipfs.dag.put({
        child
      }, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      await pin.add(parent, {
        recursive: true
      })

      const pins = await pin.ls()

      expect(pins).to.deep.include({
        hash: parent.toString(),
        type: 'recursive'
      })
      expect(pins).to.deep.include({
        hash: child.toString(),
        type: 'indirect'
      })
    })
  })
})
