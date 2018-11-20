/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')

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

  function expectPinned (hash, type, pinned = true) {
    if (typeof type === 'boolean') {
      pinned = type
      type = undefined
    }

    return pin._isPinnedWithType(hash, type || pinTypes.all)
      .then(result => expect(result.pinned).to.eql(pinned))
  }

  function clearPins () {
    return pin.ls()
      .then(ls => {
        const pinsToRemove = ls
          .filter(out => out.type === pinTypes.recursive)
          .map(out => pin.rm(out.hash))
        return Promise.all(pinsToRemove)
      })
      .then(() => pin.ls())
      .then(ls => {
        const pinsToRemove = ls
          .filter(out => out.type === pinTypes.direct)
          .map(out => pin.rm(out.hash))
        return Promise.all(pinsToRemove)
      })
  }

  before(function (done) {
    this.timeout(20 * 1000)
    repo = createTempRepo()
    ipfs = new IPFS({ repo })
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
        .then(() => pin._isPinnedWithType(pins.solarWiki, pinTypes.all))
        .then(pinned => expect(pinned.pinned).to.eql(true))
    })

    it('when node is not in datastore', function () {
      const falseHash = `${pins.root.slice(0, -2)}ss`
      return pin._isPinnedWithType(falseHash, pinTypes.all)
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
      return pin._isPinnedWithType(pins.root, pinTypes.recursive)
        .then(result => {
          expect(result.pinned).to.eql(true)
          expect(result.reason).to.eql(pinTypes.recursive)
        })
    })

    it('when pinned indirectly', function () {
      return pin._isPinnedWithType(pins.mercuryWiki, pinTypes.indirect)
        .then(result => {
          expect(result.pinned).to.eql(true)
          expect(result.reason.toBaseEncodedString()).to.eql(pins.root)
        })
    })

    it('when pinned directly', function () {
      return pin.add(pins.mercuryDir, { recursive: false })
        .then(() => {
          return pin._isPinnedWithType(pins.mercuryDir, pinTypes.direct)
            .then(result => {
              expect(result.pinned).to.eql(true)
              expect(result.reason).to.eql(pinTypes.direct)
            })
        })
    })

    it('when not pinned', function () {
      return clearPins()
        .then(() => pin._isPinnedWithType(pins.mercuryDir, pinTypes.direct))
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
          const pinChecks = Object.values(pins)
            .map(hash => expectPinned(hash))

          return Promise.all(pinChecks)
        })
    })

    it('direct', function () {
      return pin.add(pins.root, { recursive: false })
        .then(() => Promise.all([
          expectPinned(pins.root),
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

    it('can\'t pin item not in datastore', () => {
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
              { type: 'recursive',
                hash: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys' },
              { type: 'indirect',
                hash: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG' },
              { type: 'indirect',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q' },
              { type: 'indirect',
                hash: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi' }
            ])
          )
      })

      it('direct', function () {
        return pin.ls({ type: 'direct' })
          .then(out =>
            expect(out).to.deep.include.members([
              { type: 'direct',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q' }
            ])
          )
      })

      it('recursive', function () {
        return pin.ls({ type: 'recursive' })
          .then(out =>
            expect(out).to.deep.include.members([
              { type: 'recursive',
                hash: 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys' }
            ])
          )
      })

      it('indirect', function () {
        return pin.ls({ type: 'indirect' })
          .then(out =>
            expect(out).to.deep.include.members([
              { type: 'indirect',
                hash: 'QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG' },
              { type: 'indirect',
                hash: 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q' },
              { type: 'indirect',
                hash: 'QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi' }
            ])
          )
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
        .then(() => pin._load())
        .then(() => pin.ls())
        .then(ls => expect(ls.length).to.eql(1))
    })
  })
})
