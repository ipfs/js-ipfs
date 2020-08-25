/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
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
        rmAll: sinon.stub(),
        addAll: sinon.stub(),
        ls: sinon.stub(),
        query: sinon.stub()
      }
    }
  })

  describe('rm', function () {
    const defaultPinOptions = {
      recursive: true
    }

    const defaultOptions = {
      timeout: undefined
    }

    it('recursively (default)', async () => {
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively', async () => {
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        recursive: false
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        recursive: false
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('should rm and print CIDs encoded in specified base', async () => {
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = new CID(pins.root).toV1().toString('base64')
      expect(out).to.eql(`unpinned ${b64CidStr}\n`)
    })

    it('with timeout', async () => {
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin rm ${pins.root} --timeout=1s`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })
  })

  describe('add', function () {
    const defaultPinOptions = {
      recursive: true,
      metadata: undefined
    }

    const defaultOptions = {
      timeout: undefined
    }

    it('recursively (default)', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('non recursively', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        recursive: false
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        recursive: false
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('with metadata', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add --metadata key=value ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('with a metadata (short option)', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add -m key=value ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('with json metadata', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root,
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add --metadata-json '{"key":"value"}' ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('should rm and print CIDs encoded in specified base', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultOptions,
        path: pins.root,
        recursive: true,
        comments: undefined
      }], defaultOptions).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = new CID(pins.root).toV1().toString('base64')
      expect(out).to.eql(`pinned ${b64CidStr} recursively\n`)
    })

    it('recursively with timeout', async () => {
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid: new CID(pins.root)
      }])

      const out = await cli(`pin add ${pins.root} --timeout=1s`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })
  })

  describe('ls', function () {
    const defaultOptions = {
      type: 'all',
      stream: false,
      timeout: undefined,
      paths: undefined
    }

    it('lists all pins when no hash is passed', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls', { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n`)
    })

    it('handles multiple hashes', async () => {
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        paths: [pins.root, pins.solarWiki]
      }).returns([{
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
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls --quiet', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('can print quietly (short option)', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls -q', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('should ls and print CIDs encoded in specified base', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: new CID(pins.root).toV1(),
        type: 'recursive'
      }])

      const out = await cli('pin ls --cid-base=base64', { ipfs })
      expect(out).to.equal(`${new CID(pins.root).toV1().toString('base64')} recursive\n`)
    })

    it('lists all pins with a timeout', async () => {
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid: new CID(pins.root),
        type: 'recursive'
      }])

      const out = await cli('pin ls --timeout=1s', { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n`)
    })
  })
})
