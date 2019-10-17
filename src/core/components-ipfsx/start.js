'use strict'

const Bitswap = require('ipfs-bitswap')
const PeerBook = require('peer-book')
const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const defer = require('p-defer')
const { ERR_ALREADY_INITIALIZED } = require('../../errors')

const Components = require('.')

module.exports = ({
  apiManager,
  constructorOptions,
  blockService,
  gcLock,
  initOptions,
  ipld,
  keychain,
  peerInfo,
  pinManager,
  preload,
  print,
  repo
}) => async function start () {
  const startPromise = defer()
  const { cancel } = apiManager.update({ start: () => startPromise.promise })

  try {
    // The repo may be closed if previously stopped
    if (repo.closed) {
      await repo.open()
    }

    const config = await repo.config.get()

    const peerBook = new PeerBook()
    const libp2p = Components.legacy.libp2p({
      _options: constructorOptions,
      _repo: repo,
      _peerInfo: peerInfo,
      _peerInfoBook: peerBook
    }, config)

    await libp2p.start()

    const ipnsRouting = routingConfig({
      _options: constructorOptions,
      libp2p,
      _repo: repo,
      _peerInfo: peerInfo
    })
    const ipns = new IPNS(ipnsRouting, repo.datastore, peerInfo, keychain, { pass: initOptions.pass })
    const bitswap = new Bitswap(libp2p, repo.blocks, { statsEnabled: true })

    await bitswap.start()

    blockService.setExchange(bitswap)

    await preload.start()
    await ipns.republisher.start()
    // TODO: start mfs preload here

    const api = createApi({
      apiManager,
      constructorOptions,
      blockService,
      gcLock,
      initOptions,
      ipld,
      keychain,
      peerInfo,
      pinManager,
      preload,
      print,
      repo
    })

    apiManager.update(api, () => undefined)
  } catch (err) {
    cancel()
    startPromise.reject(err)
    throw err
  }

  startPromise.resolve(apiManager.api)
  return apiManager.api
}

function createApi ({
  apiManager,
  constructorOptions,
  blockService,
  gcLock,
  initOptions,
  ipld,
  keychain,
  peerInfo,
  pinManager,
  preload,
  print,
  repo
}) {
  const dag = Components.legacy.dag({ _ipld: ipld, _preload: preload })
  const object = Components.legacy.object({ _ipld: ipld, _preload: preload, dag, _gcLock: gcLock })
  const pin = Components.legacy.pin({ _ipld: ipld, _preload: preload, object, _repo: repo, _pinManager: pinManager })
  const add = Components.add({ ipld, dag, preload, pin, gcLock, constructorOptions })

  const stop = Components.stop({
    apiManager,
    constructorOptions,
    blockService,
    gcLock,
    initOptions,
    ipld,
    keychain,
    peerInfo,
    preload,
    print,
    repo
  })

  const api = {
    add,
    init: ERR_ALREADY_INITIALIZED,
    start: () => apiManager.api,
    stop
  }

  return api
}
