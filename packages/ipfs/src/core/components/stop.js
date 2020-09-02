'use strict'

const defer = require('p-defer')
const { NotStartedError, AlreadyInitializedError } = require('../errors')
const Components = require('./')
const { withTimeoutOption } = require('../utils')

module.exports = ({
  apiManager,
  options: constructorOptions,
  bitswap,
  blockService,
  gcLock,
  initOptions,
  ipld,
  ipns,
  keychain,
  libp2p,
  mfsPreload,
  peerId,
  pinManager = {},
  preload,
  print,
  repo
}) => withTimeoutOption(async function stop () {
  const stopPromise = defer()
  const { cancel } = apiManager.update({ stop: () => stopPromise.promise })

  try {
    blockService.unsetExchange()
    bitswap.stop()
    preload.stop()

    await Promise.all([
      ipns.republisher.stop(),
      mfsPreload.stop(),
      libp2p.stop(),
      repo.close()
    ])

    const api = createApi({
      apiManager,
      constructorOptions,
      blockService,
      gcLock,
      initOptions,
      ipld,
      keychain,
      peerId,
      pinManager,
      preload,
      print,
      repo
    })

    apiManager.update(api, () => { throw new NotStartedError() })
  } catch (err) {
    cancel()
    stopPromise.reject(err)
    throw err
  }

  stopPromise.resolve()
})

function createApi ({
  apiManager,
  constructorOptions,
  blockService,
  gcLock,
  initOptions,
  ipld,
  keychain,
  peerId,
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

  const pinAddAll = Components.pin.addAll({ pinManager, gcLock, dag })
  const pinRmAll = Components.pin.rmAll({ pinManager, gcLock, dag })

  const pin = {
    add: Components.pin.add({ addAll: pinAddAll }),
    addAll: pinAddAll,
    ls: Components.pin.ls({ pinManager, dag }),
    rm: Components.pin.rm({ rmAll: pinRmAll }),
    rmAll: pinRmAll
  }

  // FIXME: resolve this circular dependency
  dag.put = Components.dag.put({ ipld, pin, gcLock, preload })

  const block = {
    get: Components.block.get({ blockService, preload }),
    put: Components.block.put({ blockService, pin, gcLock, preload }),
    rm: Components.block.rm({ blockService, gcLock, pinManager }),
    stat: Components.block.stat({ blockService, preload })
  }

  const addAll = Components.addAll({ block, preload, pin, gcLock, options: constructorOptions })
  const resolve = Components.resolve({ ipld })
  const refs = Object.assign(
    Components.refs({ ipld, resolve, preload }),
    { local: Components.refs.local({ repo }) }
  )

  const notStarted = async () => { // eslint-disable-line require-await
    throw new NotStartedError()
  }

  const api = {
    add: Components.add({ addAll }),
    addAll,
    bitswap: {
      stat: notStarted,
      unwant: notStarted,
      wantlist: notStarted,
      wantlistForPeer: notStarted
    },
    block,
    bootstrap: {
      add: Components.bootstrap.add({ repo }),
      clear: Components.bootstrap.clear({ repo }),
      list: Components.bootstrap.list({ repo }),
      reset: Components.bootstrap.reset({ repo }),
      rm: Components.bootstrap.rm({ repo })
    },
    cat: Components.cat({ ipld, preload }),
    config: Components.config({ repo }),
    dag,
    dns: Components.dns(),
    files: Components.files({ ipld, block, blockService, repo, preload, options: constructorOptions }),
    get: Components.get({ ipld, preload }),
    id: Components.id({ peerId }),
    init: async () => { // eslint-disable-line require-await
      throw new AlreadyInitializedError()
    },
    isOnline: Components.isOnline({}),
    key: {
      export: Components.key.export({ keychain }),
      gen: Components.key.gen({ keychain }),
      import: Components.key.import({ keychain }),
      info: Components.key.info({ keychain }),
      list: Components.key.list({ keychain }),
      rename: Components.key.rename({ keychain }),
      rm: Components.key.rm({ keychain })
    },
    ls: Components.ls({ ipld, preload }),
    object,
    pin,
    refs,
    repo: {
      gc: Components.repo.gc({ gcLock, pin, pinManager, refs, repo }),
      stat: Components.repo.stat({ repo }),
      version: Components.repo.version({ repo })
    },
    resolve,
    start: Components.start({
      apiManager,
      options: constructorOptions,
      blockService,
      gcLock,
      initOptions,
      ipld,
      keychain,
      peerId,
      pinManager,
      preload,
      print,
      repo
    }),
    stats: {
      bitswap: notStarted,
      bw: notStarted,
      repo: Components.repo.stat({ repo })
    },
    stop: () => {},
    swarm: {
      addrs: notStarted,
      connect: notStarted,
      disconnect: notStarted,
      localAddrs: Components.swarm.localAddrs({ multiaddrs: [] }),
      peers: notStarted
    },
    version: Components.version({ repo })
  }

  return api
}
