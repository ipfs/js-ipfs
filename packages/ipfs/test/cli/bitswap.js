/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const cli = require('../utils/cli')
const sinon = require('sinon')
const Big = require('bignumber.js')

describe('bitswap', () => {
  const peerId = 'peer'
  const key0 = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
  const key1 = 'zb2rhafnd6kEUujnoMkozHnWXY7XpWttyVDWKXfChqA42VTDU'

  let ipfs

  beforeEach(() => {
    ipfs = {
      bitswap: {
        wantlist: sinon.stub(),
        stat: sinon.stub(),
        unwant: sinon.stub()
      }
    }
  })

  it('wantlist', async () => {
    ipfs.bitswap.wantlist.resolves([
      new CID(key0),
      new CID(key1)
    ])

    const out = await cli('bitswap wantlist', { ipfs })
    expect(out).to.include(key0)
    expect(out).to.include(key1)
  })

  it('should get wantlist with CIDs encoded in specified base', async () => {
    ipfs.bitswap.wantlist.resolves([
      new CID(key0),
      new CID(key1)
    ])

    const out = await cli('bitswap wantlist --cid-base=base64', { ipfs })
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64') + '\n')
  })

  it('wantlist peerid', async () => {
    ipfs.bitswap.wantlist.withArgs(peerId).resolves([])

    const out = await cli(`bitswap wantlist ${peerId}`, { ipfs })
    expect(out).to.eql('')
  })

  it('stat', async () => {
    ipfs.bitswap.stat.resolves({
      provideBufLen: Big(10),
      blocksReceived: Big(10),
      blocksSent: Big(10),
      dataReceived: Big(10),
      dupBlksReceived: Big(10),
      dupDataReceived: Big(10),
      dataSent: Big(10),
      wantlist: [
        new CID(key0),
        new CID(key1)
      ],
      peers: []
    })

    const out = await cli('bitswap stat', { ipfs })

    expect(out).to.include('bitswap status')
    expect(out).to.match(/provides buffer:\s\d+$/m)
    expect(out).to.match(/blocks received:\s\d+$/m)
    expect(out).to.match(/blocks sent:\s\d+$/m)
    expect(out).to.match(/data received:\s\d+$/m)
    expect(out).to.match(/data sent:\s\d+$/m)
    expect(out).to.match(/dup blocks received:\s\d+$/m)
    expect(out).to.match(/dup data received:\s\d+$/m)
    expect(out).to.match(/wantlist\s\[\d+\skeys\]$/m)
    expect(out).to.include(key0)
    expect(out).to.include(key1)
    expect(out).to.match(/partners\s\[\d+\]$/m)
  })

  it('stat --human', async () => {
    ipfs.bitswap.stat.resolves({
      provideBufLen: Big(10),
      blocksReceived: Big(10),
      blocksSent: Big(10),
      dataReceived: Big(10),
      dupBlksReceived: Big(10),
      dupDataReceived: Big(10),
      dataSent: Big(10),
      wantlist: [
        new CID(key0),
        new CID(key1)
      ],
      peers: []
    })

    const out = await cli('bitswap stat --human', { ipfs })

    expect(out).to.include('bitswap status')
    expect(out).to.match(/provides buffer:\s\d+$/m)
    expect(out).to.match(/blocks received:\s\d+$/m)
    expect(out).to.match(/blocks sent:\s\d+$/m)
    expect(out).to.match(/data received:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/data sent:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/dup blocks received:\s\d+$/m)
    expect(out).to.match(/dup data received:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/wantlist\s\[\d+\skeys\]$/m)
    expect(out).to.not.include(key0)
    expect(out).to.not.include(key1)
    expect(out).to.match(/partners\s\[\d+\]$/m)
  })

  it('should get stats with wantlist CIDs encoded in specified base', async () => {
    ipfs.bitswap.stat.resolves({
      provideBufLen: Big(10),
      blocksReceived: Big(10),
      blocksSent: Big(10),
      dataReceived: Big(10),
      dupBlksReceived: Big(10),
      dupDataReceived: Big(10),
      dataSent: Big(10),
      wantlist: [
        new CID(key0),
        new CID(key1)
      ],
      peers: []
    })

    const out = await cli('bitswap stat --cid-base=base64', { ipfs })
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64'))
  })

  it('unwant', async () => {
    const out = await cli('bitswap unwant ' + key0, { ipfs })
    expect(out).to.eql(`Key ${key0} removed from wantlist\n`)
    expect(ipfs.bitswap.unwant.called).to.be.true()
  })
})
