/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

const pins = {
  root: CID.parse('QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys'),
  solarWiki: CID.parse('QmTMbkDfvHwq3Aup6Nxqn3KKw9YnoKzcZvuArAfQ9GF3QG'),
  mercuryDir: CID.parse('QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'),
  mercuryWiki: CID.parse('QmVgSHAdMxFAuMP2JiMAYkB8pCWP1tcB9djqvq8GKAFiHi')
}

describe('pin', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      pin: {
        rmAll: sinon.stub(),
        addAll: sinon.stub(),
        ls: sinon.stub(),
        query: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin rm ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        recursive: false
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin rm --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        recursive: false
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin rm -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`unpinned ${pins.root}\n`)
    })

    it('should rm and print CIDs encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], defaultOptions).returns([
        pins.root.toV1()
      ])

      const out = await cli(`pin rm ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = pins.root.toV1().toString(base64)
      expect(out).to.eql(`unpinned ${b64CidStr}\n`)
    })

    it('with timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.rmAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        pins.root
      ])

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('non recursively', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        recursive: false
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add --recursive false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('non recursively (short option)', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        recursive: false
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add -r false ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} directly\n`)
    })

    it('with metadata', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add --metadata key=value ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('with a metadata (short option)', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add -m key=value ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('with json metadata', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString(),
        metadata: {
          key: 'value'
        }
      }], defaultOptions).returns([
        pins.root
      ])

      const out = await cli(`pin add --metadata-json '{"key":"value"}' ${pins.root}`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })

    it('should add and print CIDs encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], defaultOptions).returns([
        pins.root.toV1()
      ])

      const out = await cli(`pin add ${pins.root} --cid-base=base64`, { ipfs })
      const b64CidStr = pins.root.toV1().toString(base64)
      expect(out).to.eql(`pinned ${b64CidStr} recursively\n`)
    })

    it('recursively with timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.addAll.withArgs([{
        ...defaultPinOptions,
        path: pins.root.toString()
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        pins.root
      ])

      const out = await cli(`pin add ${pins.root} --timeout=1s`, { ipfs })
      expect(out).to.equal(`pinned ${pins.root} recursively\n`)
    })
  })

  describe('ls', function () {
    const defaultOptions = {
      type: 'all',
      timeout: undefined,
      paths: undefined
    }

    it('lists all pins when no hash is passed', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: pins.root,
        type: 'recursive'
      }])

      const out = await cli('pin ls', { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n`)
    })

    it('handles multiple hashes', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        paths: [pins.root.toString(), pins.solarWiki.toString()]
      }).returns([{
        cid: pins.root,
        type: 'recursive'
      }, {
        cid: pins.solarWiki,
        type: 'direct'
      }])

      const out = await cli(`pin ls ${pins.root} ${pins.solarWiki}`, { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n${pins.solarWiki} direct\n`)
    })

    it('can print quietly', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: pins.root.toString(),
        type: 'recursive'
      }])

      const out = await cli('pin ls --quiet', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('can print quietly (short option)', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: pins.root.toString(),
        type: 'recursive'
      }])

      const out = await cli('pin ls -q', { ipfs })
      expect(out).to.equal(`${pins.root}\n`)
    })

    it('should ls and print CIDs encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: pins.root.toV1(),
        type: 'recursive'
      }])

      const out = await cli('pin ls --cid-base=base64', { ipfs })
      expect(out).to.equal(`${pins.root.toV1().toString(base64)} recursive\n`)
    })

    it('lists all pins with a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid: pins.root,
        type: 'recursive'
      }])

      const out = await cli('pin ls --timeout=1s', { ipfs })
      expect(out).to.equal(`${pins.root} recursive\n`)
    })

    it('strips control characters from metadata', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: pins.root,
        type: 'recursive',
        metadata: {
          'herp\n\t': 'de\brp'
        }
      }])

      const out = await cli('pin ls', { ipfs })
      expect(out).to.equal(`${pins.root} recursive {"herp":"derp"}\n`)
    })
  })
})
