/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const cli = require('../utils/cli')
const sinon = require('sinon')
const { Buffer } = require('buffer')

describe('block', () => {
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

  it('put', async () => {
    const cid = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    ipfs.block.put.resolves({
      cid: new CID(cid)
    })

    const out = await cli('block put test/fixtures/test-data/hello', { ipfs })
    expect(out).to.eql(`${cid}\n`)
  })

  it('put with flags, format and mhtype', async () => {
    const cid = 'bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq'
    ipfs.block.put.resolves({
      cid: new CID(cid)
    })

    const out = await cli('block put --format eth-block --mhtype keccak-256 test/fixtures/test-data/eth-block', { ipfs })
    expect(out).to.eql(`${cid}\n`)

    expect(ipfs.block.put.getCall(0).args[1]).to.deep.include({
      format: 'eth-block',
      mhtype: 'keccak-256'
    })
  })

  it('should put and print CID encoded in specified base', async () => {
    const cid = 'mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH'
    ipfs.block.put.resolves({
      cid: new CID(cid)
    })

    const out = await cli('block put test/fixtures/test-data/hello --cid-base=base64', { ipfs })
    expect(out).to.eql(`${cid}\n`)
  })

  it('get', async () => {
    const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    ipfs.block.get.withArgs(cid.toString()).resolves({
      cid,
      data: Buffer.from('hello world\n')
    })

    const out = await cli(`block get ${cid}`, { ipfs })
    expect(out).to.eql('hello world\n')
  })

  it('get prints an error when no block is returned', async () => {
    const out = await cli('block get QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
    expect(out).to.eql('Block was unwanted before it could be remotely retrieved\n')
  })

  it('stat', async () => {
    const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    ipfs.block.stat.withArgs(cid.toString()).resolves({
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
    ipfs.block.stat.withArgs(cid.toString()).resolves({
      cid,
      size: 12
    })

    const out = await cli(`block stat ${cid} --cid-base=base64`, { ipfs })
    expect(out).to.eql([
      'Key: mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH',
      'Size: 12'
    ].join('\n') + '\n')
  })

  it('rm', async () => {
    const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    ipfs.block.rm.withArgs([cid.toString()]).returns([{
      cid,
      error: false
    }])

    const out = await cli('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
    expect(out).to.eql('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
  })

  it('rm prints error when removing fails', async () => {
    const err = new Error('Yikes!')
    const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    ipfs.block.rm.withArgs([cid.toString()]).returns([{
      cid,
      error: err
    }])

    const out = await cli.fail('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', { ipfs })
    expect(out).to.include(err.message)
  })

  it('rm quietly', async () => {
    const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    ipfs.block.rm.withArgs([cid.toString()], {
      force: false,
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
      force: true,
      quiet: false
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
