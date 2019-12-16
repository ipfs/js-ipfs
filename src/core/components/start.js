'use strict'

const Bitswap = require('ipfs-bitswap')
const PeerBook = require('peer-book')
const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const defer = require('p-defer')
const { AlreadyInitializedError } = require('../errors')
const Commands = require('./')

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
    const libp2p = Commands.legacy.libp2p({
      _options: constructorOptions,
      _repo: repo,
      _peerInfo: peerInfo,
      _peerInfoBook: peerBook,
      _print: print
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
      bitswap,
      constructorOptions,
      blockService,
      gcLock,
      initOptions,
      ipld,
      ipns,
      keychain,
      libp2p,
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
  bitswap,
  constructorOptions,
  blockService,
  gcLock,
  initOptions,
  ipld,
  ipns,
  keychain,
  libp2p,
  peerInfo,
  pinManager,
  preload,
  print,
  repo
}) {
  const dag = Commands.legacy.dag({ _ipld: ipld, _preload: preload })
  const object = Commands.legacy.object({ _ipld: ipld, _preload: preload, dag, _gcLock: gcLock })
  const pin = Commands.legacy.pin({ _ipld: ipld, _preload: preload, object, _repo: repo, _pinManager: pinManager })
  const add = Commands.add({ ipld, dag, preload, pin, gcLock, constructorOptions })

  const stop = Commands.stop({
    apiManager,
    bitswap,
    constructorOptions,
    blockService,
    gcLock,
    initOptions,
    ipld,
    ipns,
    keychain,
    libp2p,
    peerInfo,
    preload,
    print,
    repo
  })

  const api = {
    add,
    config: Commands.config({ repo }),
    init: () => { throw new AlreadyInitializedError() },
    start: () => apiManager.api,
    stop,
    version: Commands.version({ repo })
  }

  return api
}
