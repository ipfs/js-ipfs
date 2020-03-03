/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const {
  DAGNode
} = require('ipld-dag-pb')
const all = require('it-all')
const last = require('it-last')
const drain = require('it-drain')
const CID = require('cids')

// fixture structure:
//  planets/
//   solar-system.md
//   mercury/
//    wiki.md
/* const pins = {
  root: new CID('QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys'),
  solarWiki: new CID('QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG'),
  mercuryDir: new CID('QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'),
  mercuryWiki: new CID('QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi')
} */
let pins
const pinTypes = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('pin', function () {
    this.timeout(50 * 1000)

    const fixtures = [{
      path: 'planets/mercury/wiki.md',
      content: 'solar system content'
    }, {
      path: 'planets/solar-system.md',
      content: 'wiki content'
    }]

    let ipfs

    async function isPinnedWithType (path, type) {
      try {
        for await (const _ of ipfs.pin.ls(path, { type })) { // eslint-disable-line no-unused-vars
          return true
        }
        return false
      } catch (err) {
        return false
      }
    }

    async function expectPinned (cid, type = pinTypes.all, pinned = true) {
      if (typeof type === 'boolean') {
        pinned = type
        type = pinTypes.all
      }

      const result = await isPinnedWithType(cid, type)
      expect(result).to.eql(pinned)
    }

    async function clearPins () {
      for await (const { cid } of ipfs.pin.ls({ type: pinTypes.recursive })) {
        await drain(ipfs.pin.rm(cid))
      }

      for await (const { cid } of ipfs.pin.ls({ type: pinTypes.direct })) {
        await drain(ipfs.pin.rm(cid))
      }
    }

    before(async () => {
      ipfs = (await common.spawn()).api
      const added = (await all(ipfs.add(fixtures))).reduce((acc, curr) => {
        acc[curr.path] = curr.cid

        return acc
      }, {})

      pins = {
        root: added.planets,
        solarWiki: added['planets/solar-system.md'],
        mercuryDir: added['planets/mercury'],
        mercuryWiki: added['planets/mercury/wiki.md']
      }
    })

    after(() => common.clean())

    describe('pinned status', function () {
      beforeEach(async () => {
        await clearPins()
        await drain(ipfs.pin.add(pins.root))
      })

      it('should be pinned when added', async () => {
        await drain(ipfs.pin.add(pins.solarWiki))
        return expectPinned(pins.solarWiki)
      })

      it('should not be pinned when not in datastore', () => {
        const falseHash = `${`${pins.root}`.slice(0, -2)}ss`
        return expectPinned(falseHash, false)
      })

      it('should not be pinned when in datastore but not added', async () => {
        await drain(ipfs.pin.rm(pins.root))
        return expectPinned(pins.root, false)
      })

      it('should be pinned recursively when added', () => {
        return expectPinned(pins.root, pinTypes.recursive)
      })

      it('should be pinned indirectly', () => {
        return expectPinned(pins.mercuryWiki, pinTypes.indirect)
      })

      it('should be pinned directly', async () => {
        await drain(ipfs.pin.add(pins.mercuryDir, { recursive: false }))
        return expectPinned(pins.mercuryDir, pinTypes.direct)
      })

      it('should not be pinned when not in datastore or added', async () => {
        await clearPins()
        return expectPinned(pins.mercuryDir, pinTypes.direct, false)
      })
    })

    describe('add', function () {
      beforeEach(function () {
        return clearPins()
      })

      it('should add recursively', async () => {
        await drain(ipfs.pin.add(pins.root))
        await expectPinned(pins.root, pinTypes.recursive)

        const pinChecks = Object.values(pins).map(hash => expectPinned(hash))
        return Promise.all(pinChecks)
      })

      it('should add directly', async () => {
        await drain(ipfs.pin.add(pins.root, { recursive: false }))
        await Promise.all([
          expectPinned(pins.root, pinTypes.direct),
          expectPinned(pins.solarWiki, false)
        ])
      })

      it('should recursively pin parent of direct pin', async () => {
        await drain(ipfs.pin.add(pins.solarWiki, { recursive: false }))
        await drain(ipfs.pin.add(pins.root))
        await Promise.all([
          // solarWiki is pinned both directly and indirectly o.O
          expectPinned(pins.solarWiki, pinTypes.direct),
          expectPinned(pins.solarWiki, pinTypes.indirect)
        ])
      })

      it('should fail to directly pin a recursive pin', async () => {
        await drain(ipfs.pin.add(pins.root))
        return expect(last(ipfs.pin.add(pins.root, { recursive: false })))
          .to.eventually.be.rejected()
          .with(/already pinned recursively/)
      })

      it('should fail to pin a hash not in datastore', function () {
        this.timeout(5 * 1000)
        const falseHash = `${`${pins.root}`.slice(0, -2)}ss`
        return expect(last(ipfs.pin.add(falseHash, { timeout: '2s' })))
          .to.eventually.be.rejected()
          // TODO: http api TimeoutErrors do not have this property
          // .with.a.property('code').that.equals('ERR_TIMEOUT')
      })

      // TODO block rm breaks subsequent tests
      // it.skip('needs all children in datastore to pin recursively', () => {
      //   return ipfs.block.rm(pins.mercuryWiki)
      //     .then(() => expectTimeout(pin.add(pins.root), 4000))
      // })
    })

    describe('ls', function () {
      before(async () => {
        await clearPins()
        await drain(ipfs.pin.add(pins.root))
        await drain(ipfs.pin.add(pins.mercuryDir, { recursive: false }))
      })

      it('should list pins of a particular CID', async () => {
        const out = await all(ipfs.pin.ls(pins.mercuryDir))
        expect(out[0].cid).to.deep.equal(pins.mercuryDir)
        expect(out[0].type).to.eql(pinTypes.direct)
      })

      it('should list indirect pins that supersede direct pins', async () => {
        const ls = await all(ipfs.pin.ls())

        const pinType = ls.find(out => out.cid.equals(pins.mercuryDir)).type
        expect(pinType).to.eql(pinTypes.indirect)
      })

      it('should list all pins', async () => {
        const out = await all(ipfs.pin.ls())

        expect(out).to.deep.include.members([
          {
            type: 'recursive',
            cid: new CID(pins.root)
          },
          {
            type: 'indirect',
            cid: new CID(pins.solarWiki)
          },
          {
            type: 'indirect',
            cid: new CID(pins.mercuryDir)
          },
          {
            type: 'indirect',
            cid: new CID(pins.mercuryWiki)
          }
        ])
      })

      it('should list all direct pins', async () => {
        const out = await all(ipfs.pin.ls({ type: 'direct' }))

        expect(out).to.deep.include.members([
          {
            type: 'direct',
            cid: new CID(pins.mercuryDir)
          }
        ])
      })

      it('should list all recursive pins', async () => {
        const out = await all(ipfs.pin.ls({ type: 'recursive' }))

        expect(out).to.deep.include.members([
          {
            type: 'recursive',
            cid: new CID(pins.root)
          }
        ])
      })

      it('should list all indirect pins', async () => {
        const out = await all(ipfs.pin.ls({ type: 'indirect' }))

        expect(out).to.deep.include.members([
          {
            type: 'indirect',
            cid: new CID(pins.solarWiki)
          },
          {
            type: 'indirect',
            cid: new CID(pins.mercuryDir)
          },
          {
            type: 'indirect',
            cid: new CID(pins.mercuryWiki)
          }
        ])
      })

      it('should list direct pins for CID', async () => {
        const out = await all(ipfs.pin.ls(pins.mercuryDir, { type: 'direct' }))

        expect(out).to.have.deep.members([
          {
            type: 'direct',
            cid: new CID(pins.mercuryDir)
          }
        ])
      })

      it('should list direct pins for path', async () => {
        const out = await all(ipfs.pin.ls(`/ipfs/${pins.root}/mercury/`, { type: 'direct' }))

        expect(out).to.have.deep.members([
          {
            type: 'direct',
            cid: new CID(pins.mercuryDir)
          }
        ])
      })

      it('should list direct pins for path (no match)', () => {
        return expect(all(ipfs.pin.ls(`/ipfs/${pins.root}/mercury/wiki.md`, { type: 'direct' })))
          .to.eventually.be.rejected()
      })

      it('should list direct pins for CID (no match)', () => {
        return expect(all(ipfs.pin.ls(pins.root, { type: 'direct' })))
          .to.eventually.be.rejected()
      })

      it('should list recursive pins for CID', async () => {
        const out = await all(ipfs.pin.ls(pins.root, { type: 'recursive' }))

        expect(out).to.have.deep.members([
          {
            type: 'recursive',
            cid: new CID(pins.root)
          }
        ])
      })

      it('should list recursive pins for CID (no match)', () => {
        return expect(all(ipfs.pin.ls(pins.mercuryDir, { type: 'recursive' })))
          .to.eventually.be.rejected()
      })

      it('should list indirect pins for CID', async () => {
        const out = await all(ipfs.pin.ls(pins.solarWiki, { type: 'indirect' }))

        expect(out).to.have.deep.members([
          {
            type: `indirect through ${pins.root}`,
            cid: new CID(pins.solarWiki)
          }
        ])
      })

      it('should list indirect pins for CID (no match)', () => {
        return expect(all(ipfs.pin.ls(pins.root, { type: 'indirect' })))
          .to.eventually.be.rejected()
      })
    })

    describe('rm', function () {
      beforeEach(async () => {
        await clearPins()
        await drain(ipfs.pin.add(pins.root))
      })

      it('should remove a recursive pin', async () => {
        await drain(ipfs.pin.rm(pins.root))
        await Promise.all([
          expectPinned(pins.root, false),
          expectPinned(pins.mercuryWiki, false)
        ])
      })

      it('should remove a direct pin', async () => {
        await clearPins()
        await drain(ipfs.pin.add(pins.mercuryDir, { recursive: false }))
        await drain(ipfs.pin.rm(pins.mercuryDir))
        await expectPinned(pins.mercuryDir, false)
      })

      it('should fail to remove an indirect pin', async () => {
        await expect(last(ipfs.pin.rm(pins.solarWiki)))
          .to.eventually.be.rejected()
          .with(/is pinned indirectly under/)
        await expectPinned(pins.solarWiki)
      })

      it('should fail when an item is not pinned', async () => {
        await drain(ipfs.pin.rm(pins.root))
        await expect(last(ipfs.pin.rm(pins.root)))
          .to.eventually.be.rejected()
          .with(/is not pinned/)
      })
    })

    describe('non-dag-pb nodes', function () {
      it('should pin dag-cbor', async () => {
        const cid = await ipfs.dag.put({}, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        await drain(ipfs.pin.add(cid))

        const pins = await all(ipfs.pin.ls())

        expect(pins).to.deep.include({
          type: 'recursive',
          cid
        })
      })

      it('should pin raw', async () => {
        const cid = await ipfs.dag.put(Buffer.alloc(0), {
          format: 'raw',
          hashAlg: 'sha2-256'
        })

        await drain(ipfs.pin.add(cid))

        const pins = await all(ipfs.pin.ls())

        expect(pins).to.deep.include({
          type: 'recursive',
          cid
        })
      })

      it('should pin dag-cbor with dag-pb child', async () => {
        const child = await ipfs.dag.put(new DAGNode(Buffer.from(`${Math.random()}`)), {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        })
        const parent = await ipfs.dag.put({
          child
        }, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        await drain(ipfs.pin.add(parent, {
          recursive: true
        }))

        const pins = await all(ipfs.pin.ls())

        expect(pins).to.deep.include({
          cid: parent,
          type: 'recursive'
        })
        expect(pins).to.deep.include({
          cid: child,
          type: 'indirect'
        })
      })
    })

    describe('ls', () => {
      it('should throw error for invalid non-string pin type option', () => {
        return expect(all(ipfs.pin.ls({ type: 6 })))
          .to.eventually.be.rejected()
          // TODO: go-ipfs does not return error codes
          // .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
      })

      it('should throw error for invalid string pin type option', () => {
        return expect(all(ipfs.pin.ls({ type: '__proto__' })))
          .to.eventually.be.rejected()
          // TODO: go-ipfs does not return error codes
          // .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
      })
    })
  })
}
