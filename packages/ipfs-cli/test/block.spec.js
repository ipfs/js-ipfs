/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { cli, fail } from './utils/cli.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('block', () => {
  const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
  let ipfs

  beforeEach(() => {
    ipfs = {
      block: {
        get: sinon.stub(),
        put: sinon.stub(),
        rm: sinon.stub(),
        stat: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  describe('put', () => {
    const defaultOptions = {
      format: 'dag-pb',
      mhtype: 'sha2-256',
      version: 0,
      pin: false,
      timeout: undefined
    }

    it('should put a file', async () => {
      ipfs.block.put.withArgs(sinon.match.any, defaultOptions).resolves(cid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('block put README.md', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('put with flags, format and mhtype', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        format: 'eth-block',
        mhtype: 'keccak-256'
      }).resolves(cid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('block put --format eth-block --mhtype keccak-256 README.md', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('should put and print CID encoded in specified base', async () => {
      ipfs.block.put.withArgs(sinon.match.any, defaultOptions).resolves(cid.toV1())
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli('block put README.md --cid-base=base64', { ipfs })
      expect(out).to.eql(`${cid.toV1().toString(base64)}\n`)
    })

    it('should put and pin the block', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        pin: true
      }).resolves(cid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('block put README.md --pin', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('put with a timeout', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(cid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('block put --timeout=1s README.md', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })
  })

  describe('get', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should get a block', async () => {
      ipfs.block.get.withArgs(cid, defaultOptions).resolves(
        uint8ArrayFromString('hello world\n')
      )
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`block get ${cid}`, { ipfs })
      expect(out).to.eql('hello world\n')
    })

    it('get prints an error when no block is returned', async () => {
      const out = await cli(`block get ${cid}`, { ipfs })
      expect(out).to.eql('Block was unwanted before it could be remotely retrieved\n')
    })

    it('should get a block with a timeout', async () => {
      ipfs.block.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(
        uint8ArrayFromString('hello world\n')
      )
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`block get ${cid} --timeout=1s`, { ipfs })
      expect(out).to.eql('hello world\n')
    })
  })

  describe('stat', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should stat a block', async () => {
      ipfs.block.stat.withArgs(cid, defaultOptions).resolves({
        cid,
        size: 12
      })
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`block stat ${cid}`, { ipfs })
      expect(out).to.eql([
        `Key: ${cid}`,
        'Size: 12'
      ].join('\n') + '\n')
    })

    it('should stat and print CID encoded in specified base', async () => {
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp').toV1()
      ipfs.block.stat.withArgs(cid, defaultOptions).resolves({
        cid,
        size: 12
      })
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli(`block stat ${cid} --cid-base=base64`, { ipfs })
      expect(out).to.eql([
        'Key: mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH',
        'Size: 12'
      ].join('\n') + '\n')
    })

    it('should stat a block with a timeout', async () => {
      ipfs.block.stat.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        cid,
        size: 12
      })
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`block stat ${cid} --timeout=1s`, { ipfs })
      expect(out).to.eql([
        `Key: ${cid}`,
        'Size: 12'
      ].join('\n') + '\n')
    })
  })

  describe('rm', () => {
    const defaultOptions = {
      force: false,
      quiet: false,
      timeout: undefined
    }

    it('should remove a block', async () => {
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid], defaultOptions).returns([{
        cid,
        error: false
      }])

      const out = await cli('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.eql('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
    })

    it('rm prints error when removing fails', async () => {
      const err = new Error('Yikes!')
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid], defaultOptions).returns([{
        cid,
        error: err
      }])

      const out = await fail('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.include(err.message)
    })

    it('rm quietly', async () => {
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid], {
        ...defaultOptions,
        quiet: true
      }).returns([{
        cid,
        error: true
      }])

      const out = await cli('block rm --quiet QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.be.empty()
    })

    it('rm force', async () => {
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh')
      ipfs.block.rm.withArgs([cid], {
        ...defaultOptions,
        force: true
      }).returns([{
        cid,
        error: false
      }])

      const out = await cli('block rm --force QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh', { ipfs })
      expect(out).to.eql('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh\n')
    })

    it('fails to remove non-existent block', async () => {
      const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh')
      ipfs.block.rm.withArgs([cid]).returns([{
        cid,
        error: new Error('block not found')
      }])

      const out = await fail('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh', { ipfs })
      expect(out).to.include('block not found')
      expect(out).to.include('some blocks not removed')
    })
  })
})
