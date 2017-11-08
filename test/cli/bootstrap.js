/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('bootstrap', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(30 * 1000)
    ipfs = thing.ipfs
  })

  const defaultList = [
    '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
  ]

  const updatedList = [
    '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
    '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
    '/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
    '/ip4/111.111.111.111/tcp/1001/ipfs/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD'
  ]

  it('add default', () => {
    return ipfs('bootstrap add --default').then((out) => {
      expect(out).to.be.eql(defaultList.join('\n') + '\n')
    })
  })

  it('list the bootstrap nodes', () => {
    return ipfs('bootstrap list').then((out) => {
      expect(out).to.eql(defaultList.join('\n') + '\n')
    })
  })

  it('add another bootstrap node', () => {
    return ipfs('bootstrap add /ip4/111.111.111.111/tcp/1001/ipfs/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD').then((out) => {
      expect(out).to.be.eql('/ip4/111.111.111.111/tcp/1001/ipfs/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD\n')
      return ipfs('bootstrap list')
    }).then((out) => {
      expect(out).to.be.eql(updatedList.join('\n') + '\n')
    })
  })

  it('rm a bootstrap node', () => {
    return ipfs('bootstrap rm /ip4/111.111.111.111/tcp/1001/ipfs/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD').then((out) => {
      expect(out).to.be.eql('/ip4/111.111.111.111/tcp/1001/ipfs/QmcyFFKfLDGJKwufn2GeitxvhricsBQyNKTkrD14psikoD\n')
      return ipfs('bootstrap list')
    }).then((out) => {
      expect(out).to.deep.equal(defaultList.join('\n') + '\n')
    })
  })

  it('rm all bootstrap nodes', () => {
    return ipfs('bootstrap rm --all').then((out) => {
      expect(out).to.be.eql('')
      return ipfs('bootstrap list')
    }).then((out) => {
      expect(out).to.deep.equal('')
    })
  })
}))
