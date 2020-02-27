/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const cli = require('../utils/cli')
const sinon = require('sinon')

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

describe('pin', () => {
  let ipfs

  before(() => {
    ipfs = {
      pin: {
        rm: sinon.stub(),
        add: sinon.stub(),
        ls: sinon.stub()
      }
    }
  })

  describe('rm', function () {
    it('recursively (default)', async () => {
      ipfs.pin.rm.withArgs([pins.root], { recursive: true }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively', async () => {
      ipfs.pin.rm.withArgs([pins.root], { recursive: false }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.pin.rm.withArgs([pins.root], { recursive: false }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('should rm and print CIDs encoded in specified base', async () => {
      ipfs.pin.rm.withArgs([pins.root], { recursive: true }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = new CID(pins.root).toV1().toString('base64')
      expect(out).to.eql(`unpinned ${b64CidStr}\n`)
    })
  })

  describe('add', function () {
    it('recursively (default)', async () => {
      ipfs.pin.add.withArgs([pins.root], { recursive: true }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('non recursively', async () => {
      ipfs.pin.add.withArgs([pins.root], { recursive: false }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.pin.add.withArgs([pins.root], { recursive: false }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('should rm and print CIDs encoded in specified base', async () => {
      ipfs.pin.add.withArgs([pins.root], { recursive: true }).resolves([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = new CID(pins.root).toV1().toString('base64')
      expect(out).to.eql(`pinned ${b64CidStr} recursively\n`)
    })
  })

  describe('ls', function () {
    it('lists all pins when no hash is passed', async () => {
      ipfs.pin.ls.withArgs(undefined, { type: 'all', stream: false }).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls', { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n`)
    })

    it('handles multiple hashes', async () => {
      ipfs.pin.ls.withArgs([pins.root, pins.solarWiki], { type: 'all', stream: false }).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }, {
        cid: new CID(pins.solarWiki),
        type: 'direct'
      }])

      const out = await cli(`pin ls ${pins.root} ${pins.solarWiki}`, { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n${pins.solarWiki} direct\n`)
    })

    it('can print quietly', async () => {
      ipfs.pin.ls.withArgs(undefined, { type: 'all', stream: false }).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls --quiet', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('can print quietly (short option)', async () => {
      ipfs.pin.ls.withArgs(undefined, { type: 'all', stream: false }).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls -q', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('should ls and print CIDs encoded in specified base', async () => {
      ipfs.pin.ls.withArgs(undefined, { type: 'all', stream: false }).returns([{
        cid: new CID(pins.root).toV1(),
        type: 'recursive'
      }])

      const out = await cli('pin ls --cid-base=base64', { ipfs })
      expect(out).to.equal(`${new CID(pins.root).toV1().toString('base64')} recursive\n`)
    })
  })
})
