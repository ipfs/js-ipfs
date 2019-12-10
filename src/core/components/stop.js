'use strict'

const defer = require('p-defer')
const { NotStartedError, AlreadyInitializedError } = require('../errors')
const Commands = require('./')

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

  const start = Commands.start({
    apiManager,
    options: constructorOptions,
    blockService,
    gcLock,
    initOptions,
    ipld,
    keychain,
    object,
    peerInfo,
    pinManager,
    preload,
    print,
    repo
  })

  const api = {
    add,
    config: Commands.config({ repo }),
    id: Commands.id({ peerInfo }),
    init: () => { throw new AlreadyInitializedError() },
    start,
    stop: () => apiManager.api,
    version: Commands.version({ repo })
  }

  return api
}
