/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')

describe('bootstrap', () => {
  const peer = '/ip4/111.111.111.111/tcp/1001/p2p/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD'
  let ipfs

  before(() => {
    ipfs = {
      bootstrap: {
        add: sinon.stub(),
        list: sinon.stub(),
        rm: sinon.stub(),
        clear: sinon.stub(),
        reset: sinon.stub()
      }
    }
  })

  const defaultList = [
    '/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/ip4/104.236.179.241/tcp/4001/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip4/162.243.248.213/tcp/4001/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/ip4/128.199.219.111/tcp/4001/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip4/104.236.76.40/tcp/4001/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/178.62.158.247/tcp/4001/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/ip4/178.62.61.185/tcp/4001/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/ip4/104.236.151.122/tcp/4001/p2p/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    '/ip6/2604:a880:1:20::1f9:9001/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
    '/ip6/2604:a880:1:20::203:d001/tcp/4001/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip6/2604:a880:0:1010::23:d001/tcp/4001/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/ip6/2400:6180:0:d0::151:6001/tcp/4001/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip6/2604:a880:800:10::4a:5001/tcp/4001/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/ip6/2604:a880:1:20::1d9:6001/tcp/4001/p2p/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
    '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
    '/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
    '/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN'
  ]

  describe('add', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('add default', async () => {
      ipfs.bootstrap.reset.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const out = await cli('bootstrap add --default', { ipfs })
      expect(out).to.equal(defaultList.join('\n') + '\n')
    })

    it('add another bootstrap node', async () => {
      ipfs.bootstrap.add.withArgs(peer, defaultOptions).returns({
        Peers: defaultList.concat(peer)
      })

      const out = await cli(`bootstrap add ${peer}`, { ipfs })
      expect(out).to.include(`${peer}\n`)
    })

    it('add another bootstrap node with a timeout', async () => {
      ipfs.bootstrap.add.withArgs(peer, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: defaultList.concat(peer)
      })

      const out = await cli(`bootstrap add ${peer} --timeout=1s`, { ipfs })
      expect(out).to.include(`${peer}\n`)
    })
  })

  describe('list', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('lists the bootstrap nodes', async () => {
      ipfs.bootstrap.list.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const out = await cli('bootstrap list', { ipfs })
      expect(out).to.equal(defaultList.join('\n') + '\n')
    })

    it('lists the bootstrap nodes with a timeout', async () => {
      ipfs.bootstrap.list.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: defaultList
      })

      const out = await cli('bootstrap list --timeout=1s', { ipfs })
      expect(out).to.equal(defaultList.join('\n') + '\n')
    })
  })

  describe('rm', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should remove a bootstrap node', async () => {
      ipfs.bootstrap.rm.withArgs(peer, defaultOptions).returns({
        Peers: [
          peer
        ]
      })

      const out = await cli(`bootstrap rm ${peer}`, { ipfs })
      expect(out).to.include(`${peer}\n`)
    })

    it('should remove all bootstrap nodes', async () => {
      ipfs.bootstrap.clear.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const outRm = await cli('bootstrap rm --all', { ipfs })
      expect(outRm).to.equal(defaultList.join('\n') + '\n')
    })

    it('should remove a bootstrap node with a timeout', async () => {
      ipfs.bootstrap.rm.withArgs(peer, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: [
          peer
        ]
      })

      const out = await cli(`bootstrap rm ${peer} --timeout=1s`, { ipfs })
      expect(out).to.include(`${peer}\n`)
    })
  })
})
