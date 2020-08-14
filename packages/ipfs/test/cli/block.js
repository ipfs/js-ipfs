/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const CID = require('cids')
const cli = require('../utils/cli')
const sinon = require('sinon')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('block', () => {
  const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
  let ipfs

  beforeEach(() => {
    ipfs = {
      block: {
        get: sinon.stub(),
        put: sinon.stub(),
        rm: sinon.stub(),
        stat: sinon.stub()
      }
    }
  })

  describe('put', () => {
    const defaultOptions = {
      format: 'dag-pb',
      mhtype: 'sha2-256',
      mhlen: undefined,
      version: 0,
      pin: false,
      timeout: undefined
    }

    it('should put a file', async () => {
      ipfs.block.put.withArgs(sinon.match.any, defaultOptions).resolves({
        cid: new CID(cid)
      })

      const out = await cli('block put test/fixtures/test-data/hello', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('put with flags, format and mhtype', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        format: 'eth-block',
        mhtype: 'keccak-256'
      }).resolves({
        cid: new CID(cid)
      })

      const out = await cli('block put --format eth-block --mhtype keccak-256 test/fixtures/test-data/eth-block', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('should put and print CID encoded in specified base', async () => {
      ipfs.block.put.withArgs(sinon.match.any, defaultOptions).resolves({
        cid: new CID(cid)
      })

      const out = await cli('block put test/fixtures/test-data/hello --cid-base=base64', { ipfs })
      expect(out).to.eql(`${cid.toV1().toString('base64')}\n`)
    })

    it('should put and pin the block', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        pin: true
      }).resolves({
        cid: new CID(cid)
      })

      const out = await cli('block put test/fixtures/test-data/hello --pin', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })

    it('put with a timeout', async () => {
      ipfs.block.put.withArgs(sinon.match.any, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        cid: new CID(cid)
      })

      const out = await cli('block put --timeout=1s test/fixtures/test-data/eth-block', { ipfs })
      expect(out).to.eql(`${cid}\n`)
    })
  })

  describe('get', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should get a block', async () => {
      ipfs.block.get.withArgs(cid.toString(), defaultOptions).resolves({
        cid,
        data: uint8ArrayFromString('hello world\n')
      })

      const out = await cli(`block get ${cid}`, { ipfs })
      expect(out).to.eql('hello world\n')
    })

    it('get prints an error when no block is returned', async () => {
      const out = await cli(`block get ${cid}`, { ipfs })
      expect(out).to.eql('Block was unwanted before it could be remotely retrieved\n')
    })

    it('should get a block with a timeout', async () => {
      ipfs.block.get.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        cid,
        data: uint8ArrayFromString('hello world\n')
      })

      const out = await cli(`block get ${cid} --timeout=1s`, { ipfs })
      expect(out).to.eql('hello world\n')
    })
  })

  describe('stat', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should stat a block', async () => {
      ipfs.block.stat.withArgs(cid.toString(), defaultOptions).resolves({
        cid,
        size: 12
      })

      const out = await cli(`block stat ${cid}`, { ipfs })
      expect(out).to.eql([
        `Key: ${cid}`,
        'Size: 12'
      ].join('\n') + '\n')
    })

    it('should stat and print CID encoded in specified base', async () => {
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.stat.withArgs(cid.toString(), defaultOptions).resolves({
        cid,
        size: 12
      })

      const out = await cli(`block stat ${cid} --cid-base=base64`, { ipfs })
      expect(out).to.eql([
        'Key: mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH',
        'Size: 12'
      ].join('\n') + '\n')
    })

    it('should stat a block with a timeout', async () => {
      ipfs.block.stat.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        cid,
        size: 12
      })

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
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid.toString()], defaultOptions).returns([{
        cid,
        error: false
      }])

      const out = await cli('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.eql('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
    })

    it('rm prints error when removing fails', async () => {
      const err = new Error('Yikes!')
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid.toString()], defaultOptions).returns([{
        cid,
        error: err
      }])

      const out = await cli.fail('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.include(err.message)
    })

    it('rm quietly', async () => {
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      ipfs.block.rm.withArgs([cid.toString()], {
        ...defaultOptions,
        quiet: true
      }).returns([{
        cid,
        error: true
      }])

      const out = await cli('block rm --quiet QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
      expect(out).to.eql('')
    })

    it('rm force', async () => {
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh')
      ipfs.block.rm.withArgs([cid.toString()], {
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
      const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh')
      ipfs.block.rm.withArgs([cid.toString()]).returns([{
        cid,
        error: new Error('block not found')
      }])

      const out = await cli.fail('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kh', { ipfs })
      expect(out).to.include('block not found')
      expect(out).to.include('some blocks not removed')
    })
  })
})
