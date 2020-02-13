'use strict'

const Bitswap = require('ipfs-bitswap')
const multiaddr = require('multiaddr')
const get = require('dlv')
const defer = require('p-defer')
const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const { AlreadyInitializedError, NotEnabledError } = require('../errors')
const Components = require('./')
const createMfsPreload = require('../mfs-preload')

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

    if (config.Addresses && config.Addresses.Swarm) {
      config.Addresses.Swarm.forEach(addr => {
        let ma = multiaddr(addr)

        if (ma.getPeerId()) {
          ma = ma.encapsulate(`/p2p/${peerInfo.id.toB58String()}`)
        }

        peerInfo.multiaddrs.add(ma)
      })
    }

    const libp2p = Components.libp2p({
      options: constructorOptions,
      repo,
      peerInfo,
      print,
      config
    })

    await libp2p.start()

    peerInfo.multiaddrs.forEach(ma => print(`Swarm listening on ${ma}/p2p/${peerInfo.id.toB58String()}`))

    const ipnsRouting = routingConfig({ libp2p, repo, peerInfo, options: constructorOptions })
    const ipns = new IPNS(ipnsRouting, repo.datastore, peerInfo, keychain, { pass: initOptions.pass })
    const bitswap = new Bitswap(libp2p, repo.blocks, { statsEnabled: true })

    await bitswap.start()

    blockService.setExchange(bitswap)

    const files = Components.files({ ipld, blockService, repo, preload, options: constructorOptions })
    const mfsPreload = createMfsPreload({ files, preload, options: constructorOptions.preload })

    await Promise.all([
      ipns.republisher.start(),
      preload.start(),
      mfsPreload.start()
    ])

    const api = createApi({
      apiManager,
      bitswap,
      blockService,
      config,
      constructorOptions,
      files,
      gcLock,
      initOptions,
      ipld,
      ipns,
      keychain,
      libp2p,
      mfsPreload,
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
  blockService,
  config,
  constructorOptions,
  files,
  gcLock,
  initOptions,
  ipld,
  ipns,
  keychain,
  libp2p,
  mfsPreload,
  peerInfo,
  pinManager,
  preload,
  print,
  repo
}) {
  const dag = {
    get: Components.dag.get({ ipld, preload }),
    resolve: Components.dag.resolve({ ipld, preload }),
    tree: Components.dag.tree({ ipld, preload })
  }
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
  const pin = {
    add: Components.pin.add({ pinManager, gcLock, dag }),
    ls: Components.pin.ls({ pinManager, dag }),
    rm: Components.pin.rm({ pinManager, gcLock, dag })
  }
  // FIXME: resolve this circular dependency
  dag.put = Components.dag.put({ ipld, pin, gcLock, preload })
  const add = Components.add({ ipld, preload, pin, gcLock, options: constructorOptions })
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

  const pubsubNotEnabled = async () => { // eslint-disable-line require-await
    throw new NotEnabledError('pubsub not enabled')
  }

  const pubsub = get(constructorOptions, 'config.Pubsub.Enabled', get(config, 'Pubsub.Enabled', true))
    ? Components.pubsub({ libp2p })
    : {
      subscribe: pubsubNotEnabled,
      unsubscribe: pubsubNotEnabled,
      publish: pubsubNotEnabled,
      ls: pubsubNotEnabled,
      peers: pubsubNotEnabled
    }

  const api = {
    add,
    bitswap: {
      stat: Components.bitswap.stat({ bitswap }),
      unwant: Components.bitswap.unwant({ bitswap }),
      wantlist: Components.bitswap.wantlist({ bitswap })
    },
    block: {
      get: Components.block.get({ blockService, preload }),
      put: Components.block.put({ blockService, gcLock, preload }),
      rm: Components.block.rm({ blockService, gcLock, pinManager }),
      stat: Components.block.stat({ blockService, preload })
    },
    bootstrap: {
      add: Components.bootstrap.add({ repo }),
      list: Components.bootstrap.list({ repo }),
      rm: Components.bootstrap.rm({ repo })
    },
    cat: Components.cat({ ipld, preload }),
    config: Components.config({ repo }),
    dag,
    dns,
    files,
    get: Components.get({ ipld, preload }),
    id: Components.id({ peerInfo, libp2p }),
    init: async () => { throw new AlreadyInitializedError() }, // eslint-disable-line require-await
    isOnline,
    key: {
      export: Components.key.export({ keychain }),
      gen: Components.key.gen({ keychain }),
      import: Components.key.import({ keychain }),
      info: Components.key.info({ keychain }),
      list: Components.key.list({ keychain }),
      rename: Components.key.rename({ keychain }),
      rm: Components.key.rm({ keychain })
    },
    libp2p,
    ls: Components.ls({ ipld, preload }),
    name,
    object,
    pin,
    ping: Components.ping({ libp2p }),
    pubsub,
    refs,
    repo: {
      gc: Components.repo.gc({ gcLock, pin, pinManager, refs, repo }),
      stat: Components.repo.stat({ repo }),
      version: Components.repo.version({ repo })
    },
    resolve,
    start: () => apiManager.api,
    stats: {
      bitswap: Components.bitswap.stat({ bitswap }),
      bw: libp2p.metrics
        ? Components.stats.bw({ libp2p })
        : async () => { // eslint-disable-line require-await
          throw new NotEnabledError('libp2p metrics not enabled')
        },
      repo: Components.repo.stat({ repo })
    },
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
      mfsPreload,
      peerInfo,
      preload,
      print,
      repo
    }),
    swarm: {
      addrs: Components.swarm.addrs({ libp2p }),
      connect: Components.swarm.connect({ libp2p }),
      disconnect: Components.swarm.disconnect({ libp2p }),
      localAddrs: Components.swarm.localAddrs({ peerInfo }),
      peers: Components.swarm.peers({ libp2p })
    },
    version: Components.version({ repo })
  }

  return api
}
