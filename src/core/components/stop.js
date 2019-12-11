'use strict'

const defer = require('p-defer')
const { NotStartedError, AlreadyInitializedError } = require('../errors')
const Components = require('./')

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
  peerInfo,
  pinManager,
  preload,
  print,
  repo
}) => async function stop () {
  const stopPromise = defer()
  const { cancel } = apiManager.update({ stop: () => stopPromise.promise })

  try {
    blockService.unsetExchange()
    bitswap.stop()
    preload.stop()

    await Promise.all([
      ipns.republisher.stop(),
      // mfsPreload.stop(),
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
      peerInfo,
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

  stopPromise.resolve(apiManager.api)
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
  const refs = () => { throw new NotStartedError() }
  refs.local = Components.refs.local({ repo })

  const api = {
    add,
    cat: Components.cat({ ipld, preload }),
    config: Components.config({ repo }),
    dns: Components.dns(),
    get: Components.get({ ipld, preload }),
    id: Components.id({ peerInfo }),
    init: () => { throw new AlreadyInitializedError() },
    isOnline: Components.isOnline({}),
    ls: Components.ls({ ipld, preload }),
    refs,
    start: Components.start({
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
    }),
    stop: () => apiManager.api,
    version: Components.version({ repo })
  }

  return api
}
