'use strict'

const Bitswap = require('ipfs-bitswap')
const PeerBook = require('peer-book')
const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const defer = require('p-defer')
const { AlreadyInitializedError, NotEnabledError } = require('../errors')
const Components = require('./')

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
    const libp2p = Components.legacy.libp2p({
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
  const dag = Components.legacy.dag({ _ipld: ipld, _preload: preload })
  const object = {
    data: Components.object.data({ ipld, preload }),
    get: Components.object.get({ ipld, preload }),
    links: Components.object.links({ dag }),
    new: Components.object.new({ ipld, preload }),
    patch: {
      addLink: Components.object.patch.addLink({ ipld, gcLock, preload }),
      appendData: Components.object.patch.appendData({ ipld, gcLock, preload }),
      rmLink: Components.object.patch.rmLink({ ipld, gcLock, preload }),
      setData: Components.object.patch.setData({ ipld, gcLock, preload })
    },
    put: Components.object.put({ ipld, gcLock, preload }),
    stat: Components.object.stat({ ipld, preload })
  }
  const pin = Components.legacy.pin({ _ipld: ipld, _preload: preload, object, _repo: repo, _pinManager: pinManager })
  const add = Components.add({ ipld, dag, preload, pin, gcLock, options: constructorOptions })
  const isOnline = Components.isOnline({ libp2p })
  const dns = Components.dns()
  const name = {
    pubsub: {
      cancel: Components.name.pubsub.cancel({ ipns, options: constructorOptions }),
      state: Components.name.pubsub.state({ ipns, options: constructorOptions }),
      subs: Components.name.pubsub.subs({ ipns, options: constructorOptions })
    },
    publish: Components.name.publish({ ipns, dag, peerInfo, isOnline, keychain, options: constructorOptions }),
    resolve: Components.name.resolve({ dns, ipns, peerInfo, isOnline, options: constructorOptions })
  }
  const resolve = Components.resolve({ name, ipld })
  const refs = Components.refs({ ipld, resolve, preload })
  refs.local = Components.refs.local({ repo })

  const api = {
    add,
    bitswap: {
      stat: Components.bitswap.stat({ bitswap }),
      unwant: Components.bitswap.unwant({ bitswap }),
      wantlist: Components.bitswap.wantlist({ bitswap })
    },
    cat: Components.cat({ ipld, preload }),
    config: Components.config({ repo }),
    dns,
    get: Components.get({ ipld, preload }),
    id: Components.id({ peerInfo }),
    init: () => { throw new AlreadyInitializedError() },
    ls: Components.ls({ ipld, preload }),
    name,
    ping: Components.ping({ libp2p }),
    pubsub: libp2p.pubsub
      ? Components.pubsub({ libp2p })
      : () => { throw new NotEnabledError('pubsub not enabled') },
    refs,
    resolve,
    start: () => apiManager.api,
    stop: Components.stop({
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
      peerInfo,
      preload,
      print,
      repo
    }),
    version: Components.version({ repo })
  }

  return api
}
