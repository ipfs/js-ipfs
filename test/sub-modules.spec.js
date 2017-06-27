/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const defaultConfig = require('../src/utils/default-config.js')
const config = defaultConfig()
config.host = 'test'
config.port = '1111'

describe('submodules', () => {
  it('bitswap', () => {
    const bitswap = require('../src/bitswap')(config)

    expect(bitswap.wantlist).to.be.a('function')
    expect(bitswap.stat).to.be.a('function')
    expect(bitswap.unwant).to.be.a('function')
  })

  it('block', () => {
    const block = require('../src/block')(config)

    expect(block.get).to.be.a('function')
    expect(block.stat).to.be.a('function')
    expect(block.put).to.be.a('function')
  })

  it('bootstrap', () => {
    const bootstrap = require('../src/bootstrap')(config)

    expect(bootstrap.add).to.be.a('function')
    expect(bootstrap.rm).to.be.a('function')
    expect(bootstrap.list).to.be.a('function')
  })

  it('config', () => {
    const cfg = require('../src/config')(config)

    expect(cfg.get).to.be.a('function')
    expect(cfg.set).to.be.a('function')
    expect(cfg.replace).to.be.a('function')
  })

  it('dht', () => {
    const dht = require('../src/dht')(config)

    expect(dht.get).to.be.a('function')
    expect(dht.put).to.be.a('function')
    expect(dht.findprovs).to.be.a('function')
    expect(dht.findpeer).to.be.a('function')
    expect(dht.provide).to.be.a('function')
    expect(dht.query).to.be.a('function')
  })

  it('id', () => {
    const id = require('../src/id')(config)

    expect(id).to.be.a('function')
  })

  it('version', () => {
    const version = require('../src/version')(config)

    expect(version).to.be.a('function')
  })

  it('ping', () => {
    const ping = require('../src/ping')(config)

    expect(ping).to.be.a('function')
  })

  it('log', () => {
    const log = require('../src/log')(config)

    expect(log.ls).to.be.a('function')
    expect(log.tail).to.be.a('function')
    expect(log.level).to.be.a('function')
  })

  it('key', () => {
    const key = require('../src/key')(config)

    expect(key.gen).to.be.a('function')
    expect(key.list).to.be.a('function')
  })

  it('name', () => {
    const name = require('../src/name')(config)

    expect(name.publish).to.be.a('function')
    expect(name.resolve).to.be.a('function')
  })

  it('pin', () => {
    const pin = require('../src/pin')(config)

    expect(pin.add).to.be.a('function')
    expect(pin.rm).to.be.a('function')
    expect(pin.ls).to.be.a('function')
  })

  it('repo', () => {
    const repo = require('../src/repo')(config)

    expect(repo.gc).to.be.a('function')
    expect(repo.stat).to.be.a('function')
  })

  it('swarm', () => {
    const swarm = require('../src/swarm')(config)

    expect(swarm.peers).to.be.a('function')
    expect(swarm.connect).to.be.a('function')
    expect(swarm.disconnect).to.be.a('function')
    expect(swarm.addrs).to.be.a('function')
    expect(swarm.localAddrs).to.be.a('function')
  })

  it('diag', () => {
    const diag = require('../src/diag')(config)

    expect(diag.net).to.be.a('function')
    expect(diag.sys).to.be.a('function')
    expect(diag.cmds).to.be.a('function')
  })

  it('object', () => {
    const object = require('../src/object')(config)

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
    const pubsub = require('../src/pubsub')(config)

    expect(pubsub.subscribe).to.be.a('function')
    expect(pubsub.unsubscribe).to.be.a('function')
    expect(pubsub.publish).to.be.a('function')
    expect(pubsub.ls).to.be.a('function')
    expect(pubsub.peers).to.be.a('function')
  })

  it('files', () => {
    const files = require('../src/files')(config)

    expect(files.add).to.be.a('function')
    expect(files.createAddStream).to.be.a('function')
    expect(files.get).to.be.a('function')
    expect(files.cat).to.be.a('function')
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
    const commands = require('../src/commands')(config)

    expect(commands).to.be.a('function')
  })

  it('ls', () => {
    const ls = require('../src/ls')(config)

    expect(ls).to.be.a('function')
  })

  it('mount', () => {
    const mount = require('../src/mount')(config)

    expect(mount).to.be.a('function')
  })

  it('fs-add', () => {
    const fsAdd = require('../src/util/fs-add')(config)

    expect(fsAdd).to.be.a('function')
  })

  it('url-add', () => {
    const urlAdd = require('../src/util/url-add')(config)

    expect(urlAdd).to.be.a('function')
  })

  it('refs', () => {
    const refs = require('../src/refs')(config)

    expect(refs).to.be.a('function')
    expect(refs.local).to.be.a('function')
  })

  it('add', () => {
    const add = require('../src/add')(config)

    expect(add).to.be.a('function')
  })

  it('get', () => {
    const get = require('../src/get')(config)

    expect(get).to.be.a('function')
  })

  it('cat', () => {
    const cat = require('../src/cat')(config)

    expect(cat).to.be.a('function')
  })
})
