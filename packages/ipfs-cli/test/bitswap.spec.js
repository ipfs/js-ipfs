/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

describe('bitswap', () => {
  const peerId = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNA'
  const key0 = CID.parse('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  const key1 = CID.parse('zb2rhafnd6kEUujnoMkozHnWXY7XpWttyVDWKXfChqA42VTDU')

  let ipfs

  beforeEach(() => {
    ipfs = {
      bitswap: {
        wantlist: sinon.stub(),
        wantlistForPeer: sinon.stub(),
        stat: sinon.stub(),
        unwant: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  describe('wantlist', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should return the wantlist', async () => {
      ipfs.bitswap.wantlist.withArgs(defaultOptions).resolves([
        key0,
        key1
      ])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('bitswap wantlist', { ipfs })
      expect(out).to.include(key0.toString(base58btc))
      expect(out).to.include(key1.toString(base58btc))
    })

    it('should get wantlist with CIDs encoded in specified base', async () => {
      ipfs.bitswap.wantlist.withArgs({
        ...defaultOptions
      }).resolves([
        key0.toV1(),
        key1.toV1()
      ])
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli('bitswap wantlist --cid-base=base64', { ipfs })
      expect(out).to.include(key0.toV1().toString(base64) + '\n')
      expect(out).to.include(key1.toV1().toString(base64) + '\n')
    })

    it('wantlist peerid', async () => {
      ipfs.bitswap.wantlistForPeer.withArgs(peerId, defaultOptions).resolves([])

      const out = await cli(`bitswap wantlist ${peerId}`, { ipfs })
      expect(out).to.be.empty()
    })

    it('wantlist with a timeout', async () => {
      ipfs.bitswap.wantlist.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([])

      const out = await cli('bitswap wantlist --timeout=1s', { ipfs })
      expect(out).to.be.empty()
    })

    it('wantlist for peer with a timeout', async () => {
      ipfs.bitswap.wantlistForPeer.withArgs(peerId, {
        ...defaultOptions,
        timeout: 1000
      }).resolves([])

      const out = await cli(`bitswap wantlist ${peerId} --timeout=1s`, { ipfs })
      expect(out).to.be.empty()
    })
  })

  describe('stat', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should return bitswap stats', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).resolves({
        provideBufLen: BigInt(10),
        blocksReceived: BigInt(10),
        blocksSent: BigInt(10),
        dataReceived: BigInt(10),
        dupBlksReceived: BigInt(10),
        dupDataReceived: BigInt(10),
        dataSent: BigInt(10),
        wantlist: [
          key0,
          key1
        ],
        peers: []
      })
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
      expect(out).to.include(key0.toString(base58btc))
      expect(out).to.include(key1.toString(base58btc))
      expect(out).to.match(/partners\s\[\d+\]$/m)
    })

    it('stat --human', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).resolves({
        provideBufLen: BigInt(10),
        blocksReceived: BigInt(10),
        blocksSent: BigInt(10),
        dataReceived: BigInt(10),
        dupBlksReceived: BigInt(10),
        dupDataReceived: BigInt(10),
        dataSent: BigInt(10),
        wantlist: [
          key0,
          key1
        ],
        peers: []
      })
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
      expect(out).to.match(/partners\s\[\d+\]$/m)
    })

    it('should get stats with wantlist CIDs encoded in specified base', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).resolves({
        provideBufLen: BigInt(10),
        blocksReceived: BigInt(10),
        blocksSent: BigInt(10),
        dataReceived: BigInt(10),
        dupBlksReceived: BigInt(10),
        dupDataReceived: BigInt(10),
        dataSent: BigInt(10),
        wantlist: [
          key0.toV1(),
          key1.toV1()
        ],
        peers: []
      })
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli('bitswap stat --cid-base=base64', { ipfs })
      expect(out).to.include(key1.toV1().toString(base64))
    })

    it('should return bitswap stats with a timeout', async () => {
      ipfs.bitswap.stat.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        provideBufLen: BigInt(10),
        blocksReceived: BigInt(10),
        blocksSent: BigInt(10),
        dataReceived: BigInt(10),
        dupBlksReceived: BigInt(10),
        dupDataReceived: BigInt(10),
        dataSent: BigInt(10),
        wantlist: [
          key0,
          key1
        ],
        peers: []
      })
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('bitswap stat --timeout=1s', { ipfs })

      expect(out).to.include('bitswap status')
      expect(out).to.match(/provides buffer:\s\d+$/m)
      expect(out).to.match(/blocks received:\s\d+$/m)
      expect(out).to.match(/blocks sent:\s\d+$/m)
      expect(out).to.match(/data received:\s\d+$/m)
      expect(out).to.match(/data sent:\s\d+$/m)
      expect(out).to.match(/dup blocks received:\s\d+$/m)
      expect(out).to.match(/dup data received:\s\d+$/m)
      expect(out).to.match(/wantlist\s\[\d+\skeys\]$/m)
      expect(out).to.include(key0.toString(base58btc))
      expect(out).to.include(key1.toString(base58btc))
      expect(out).to.match(/partners\s\[\d+\]$/m)
    })
  })

  describe('unwant', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should unwant a block', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('bitswap unwant ' + key0, { ipfs })
      expect(out).to.eql(`Key ${key0} removed from wantlist\n`)
      expect(ipfs.bitswap.unwant.called).to.be.true()
    })

    it('should unwant a block with a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`bitswap unwant ${key0} --timeout=1s`, { ipfs })
      expect(out).to.eql(`Key ${key0} removed from wantlist\n`)
      expect(ipfs.bitswap.unwant.called).to.be.true()
      expect(ipfs.bitswap.unwant.getCall(0).args).to.deep.equal([key0, {
        ...defaultOptions,
        timeout: 1000
      }])
    })
  })
})
