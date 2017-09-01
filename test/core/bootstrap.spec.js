/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

const IPFS = require('../../src/core')

describe('bootstrap', () => {
  if (!isNode) { return }

  let node

  before((done) => {
    node = new IPFS({
      repo: createTempRepo(),
      init: {
        bits: 1024
      },
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/0']
        }
      }
    })

    node.on('error', (err) => {
      expect(err).to.not.exist()
    })

    node.on('start', done)
  })

  after((done) => node.stop(done))

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
    '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
  ]

  it('get bootstrap list', (done) => {
    node.bootstrap.list((err, list) => {
      expect(err).to.not.exist()
      expect(list.Peers).to.deep.equal(defaultList)
      done()
    })
  })

  it('add a peer to the bootstrap list', (done) => {
    node.bootstrap.add('/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.eql({Peers: ['/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT']})
      node.bootstrap.list((err, list) => {
        expect(err).to.not.exist()
        expect(list.Peers).to.deep.equal(updatedList)
        done()
      })
    })
  })

  it('remove a peer from the bootstrap list', (done) => {
    node.bootstrap.rm('/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.eql({Peers: ['/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT']})
      node.bootstrap.list((err, list) => {
        expect(err).to.not.exist()
        expect(list.Peers).to.deep.equal(defaultList)
        done()
      })
    })
  })
})
