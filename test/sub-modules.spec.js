/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')

describe('submodules', () => {
  it('bitswap', () => {
    const bitswap = require('../src/bitswap')()

    expect(bitswap.wantlist).to.be.a('function')
    expect(bitswap.stat).to.be.a('function')
    expect(bitswap.unwant).to.be.a('function')
  })

  it('block', () => {
    const block = require('../src/block')()

    expect(block.get).to.be.a('function')
    expect(block.stat).to.be.a('function')
    expect(block.put).to.be.a('function')
  })

  it('bootstrap', () => {
    const bootstrap = require('../src/bootstrap')()

    expect(bootstrap.add).to.be.a('function')
    expect(bootstrap.rm).to.be.a('function')
    expect(bootstrap.list).to.be.a('function')
  })

  it('config', () => {
    const cfg = require('../src/config')()

    expect(cfg.get).to.be.a('function')
    expect(cfg.set).to.be.a('function')
    expect(cfg.replace).to.be.a('function')
    expect(cfg).to.have.a.property('profiles')
    expect(cfg.profiles.list).to.be.a('function')
    expect(cfg.profiles.apply).to.be.a('function')
  })

  it('dht', () => {
    const dht = require('../src/dht')()

    expect(dht.get).to.be.a('function')
    expect(dht.put).to.be.a('function')
    expect(dht.findProvs).to.be.a('function')
    expect(dht.findPeer).to.be.a('function')
    expect(dht.provide).to.be.a('function')
    expect(dht.query).to.be.a('function')
  })

  it('id', () => {
    const id = require('../src/id')()

    expect(id).to.be.a('function')
  })

  it('version', () => {
    const version = require('../src/version')()

    expect(version).to.be.a('function')
  })

  it('ping', () => {
    const ping = require('../src')().ping
    const pingPullStream = require('../src')().pingPullStream
    const pingReadableStream = require('../src')().pingReadableStream

    expect(ping).to.be.a('function')
    expect(pingPullStream).to.be.a('function')
    expect(pingReadableStream).to.be.a('function')
  })

  it('log', () => {
    const log = require('../src/log')()

    expect(log.ls).to.be.a('function')
    expect(log.tail).to.be.a('function')
    expect(log.level).to.be.a('function')
  })

  it('key', () => {
    const key = require('../src/key')()

    expect(key.gen).to.be.a('function')
    expect(key.list).to.be.a('function')
  })

  it('name', () => {
    const name = require('../src/name')()

    expect(name.publish).to.be.a('function')
    expect(name.resolve).to.be.a('function')
  })

  it('pin', () => {
    const pin = require('../src/pin')()

    expect(pin.add).to.be.a('function')
    expect(pin.rm).to.be.a('function')
    expect(pin.ls).to.be.a('function')
  })

  it('repo', () => {
    const repo = require('../src/repo')()

    expect(repo.gc).to.be.a('function')
    expect(repo.stat).to.be.a('function')
  })

  it('stats', () => {
    const stats = require('../src/stats')()

    expect(stats.bitswap).to.be.a('function')
    expect(stats.bw).to.be.a('function')
    expect(stats.repo).to.be.a('function')
  })

  it('swarm', () => {
    const swarm = require('../src/swarm')()

    expect(swarm.peers).to.be.a('function')
    expect(swarm.connect).to.be.a('function')
    expect(swarm.disconnect).to.be.a('function')
    expect(swarm.addrs).to.be.a('function')
    expect(swarm.localAddrs).to.be.a('function')
  })

  it('diag', () => {
    const diag = require('../src/diag')()

    expect(diag.net).to.be.a('function')
    expect(diag.sys).to.be.a('function')
    expect(diag.cmds).to.be.a('function')
  })

  it('object', () => {
    const object = require('../src/object')()

    expect(object.get).to.be.a('function')
    expect(object.put).to.be.a('function')
    expect(object.data).to.be.a('function')
    expect(object.links).to.be.a('function')
    expect(object.stat).to.be.a('function')
    expect(object.new).to.be.a('function')
    expect(object.patch.rmLink).to.be.a('function')
    expect(object.patch.addLink).to.be.a('function')
    expect(object.patch.setData).to.be.a('function')
    expect(object.patch.appendData).to.be.a('function')
  })

  it('pubsub', () => {
    const pubsub = require('../src/pubsub')()

    expect(pubsub.subscribe).to.be.a('function')
    expect(pubsub.unsubscribe).to.be.a('function')
    expect(pubsub.publish).to.be.a('function')
    expect(pubsub.ls).to.be.a('function')
    expect(pubsub.peers).to.be.a('function')
  })

  it('files regular API', () => {
    const filesRegular = require('../src')()

    expect(filesRegular.add).to.be.a('function')
    expect(filesRegular.addReadableStream).to.be.a('function')
    expect(filesRegular.addPullStream).to.be.a('function')
    expect(filesRegular.addFromStream).to.be.a('function')
    expect(filesRegular.addFromFs).to.be.a('function')
    expect(filesRegular.addFromURL).to.be.a('function')
    expect(filesRegular.get).to.be.a('function')
    expect(filesRegular.getReadableStream).to.be.a('function')
    expect(filesRegular.getPullStream).to.be.a('function')
    expect(filesRegular.cat).to.be.a('function')
    expect(filesRegular.catReadableStream).to.be.a('function')
    expect(filesRegular.catPullStream).to.be.a('function')
    expect(filesRegular.ls).to.be.a('function')
    expect(filesRegular.lsReadableStream).to.be.a('function')
    expect(filesRegular.lsPullStream).to.be.a('function')
    expect(filesRegular.refs).to.be.a('function')
    expect(filesRegular.refsReadableStream).to.be.a('function')
    expect(filesRegular.refsPullStream).to.be.a('function')
    expect(filesRegular.refs.local).to.be.a('function')
    expect(filesRegular.refs.localReadableStream).to.be.a('function')
    expect(filesRegular.refs.localPullStream).to.be.a('function')
  })

  it('files MFS API', () => {
    const files = require('../src/files')()

    expect(files.cp).to.be.a('function')
    expect(files.ls).to.be.a('function')
    expect(files.mkdir).to.be.a('function')
    expect(files.stat).to.be.a('function')
    expect(files.rm).to.be.a('function')
    expect(files.read).to.be.a('function')
    expect(files.write).to.be.a('function')
    expect(files.mv).to.be.a('function')
  })

  it('commands', () => {
    const commands = require('../src/commands')()

    expect(commands).to.be.a('function')
  })

  it('mount', () => {
    const mount = require('../src/mount')()

    expect(mount).to.be.a('function')
  })
})
