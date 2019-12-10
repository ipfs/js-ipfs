'use strict'

const Bitswap = require('ipfs-bitswap')
const PeerBook = require('peer-book')
const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const defer = require('p-defer')
const { AlreadyInitializedError, NotEnabledError } = require('../errors')
const Commands = require('./')

module.exports = ({
  apiManager,
  options: constructorOptions,
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
  const object = {
    data: Commands.object.data({ ipld, preload }),
    get: Commands.object.get({ ipld, preload }),
    links: Commands.object.links({ dag }),
    new: Commands.object.new({ ipld, preload }),
    patch: {
      addLink: Commands.object.patch.addLink({ ipld, gcLock, preload }),
      appendData: Commands.object.patch.appendData({ ipld, gcLock, preload }),
      rmLink: Commands.object.patch.rmLink({ ipld, gcLock, preload }),
      setData: Commands.object.patch.setData({ ipld, gcLock, preload })
    },
    put: Commands.object.put({ ipld, gcLock, preload }),
    stat: Commands.object.stat({ ipld, preload })
  }
  const pin = Commands.legacy.pin({ _ipld: ipld, _preload: preload, object, _repo: repo, _pinManager: pinManager })
  const add = Commands.add({ ipld, dag, preload, pin, gcLock, options: constructorOptions })

  const stop = Commands.stop({
    apiManager,
    bitswap,
    options: constructorOptions,
    blockService,
    gcLock,
    initOptions,
    ipld,
    ipns,
    keychain,
    libp2p,
    object,
    peerInfo,
    preload,
    print,
    repo
  })

  const api = {
    add,
    bitswap: {
      stat: Commands.bitswap.stat({ bitswap }),
      unwant: Commands.bitswap.unwant({ bitswap }),
      wantlist: Commands.bitswap.wantlist({ bitswap })
    },
    config: Commands.config({ repo }),
    id: Commands.id({ peerInfo }),
    init: () => { throw new AlreadyInitializedError() },
    ping: Commands.ping({ libp2p }),
    pubsub: libp2p.pubsub
      ? Commands.pubsub({ libp2p })
      : () => { throw new NotEnabledError('pubsub not enabled') },
    start: () => apiManager.api,
    stop,
    version: Commands.version({ repo })
  }

  return api
}
