'use strict'

const get = require('dlv')
const mergeOptions = require('merge-options')
const log = require('debug')('ipfs:libp2p')
const ipnsUtils = require('../ipns/routing/utils')

module.exports = function libp2p (self, config) {
  const options = self._options || {}
  config = config || {}

  // Always create libp2p via a bundle function
  const createBundle = typeof options.libp2p === 'function'
    ? options.libp2p
    : defaultBundle

  const { datastore } = self._repo
  const peerInfo = self._peerInfo
  const peerBook = self._peerInfoBook
  const libp2p = createBundle({ options, config, datastore, peerInfo, peerBook })

  const dialQueue = new DialQueue(libp2p, peerBook)

  libp2p.on('stop', () => {
    // Clear our addresses so we can start clean
    peerInfo.multiaddrs.clear()
  })

  libp2p.on('start', () => {
    peerInfo.multiaddrs.forEach((ma) => {
      self._print('Swarm listening on', ma.toString())
    })
    dialQueue.start()
  })

  libp2p.on('peer:discovery', peerInfo => dialQueue.add(peerInfo))

  libp2p.on('peer:connect', peerInfo => peerBook.put(peerInfo))

  const _stop = libp2p.stop.bind(libp2p)
  libp2p.stop = cb => {
    dialQueue.stop()
    _stop(cb)
  }

  return libp2p
}

function defaultBundle ({ datastore, peerInfo, peerBook, options, config }) {
  const libp2pDefaults = {
    datastore,
    peerInfo,
    peerBook,
    config: {
      peerDiscovery: {
        mdns: {
          enabled: get(options, 'config.Discovery.MDNS.Enabled',
            get(config, 'Discovery.MDNS.Enabled', true))
        },
        webRTCStar: {
          enabled: get(options, 'config.Discovery.webRTCStar.Enabled',
            get(config, 'Discovery.webRTCStar.Enabled', true))
        },
        bootstrap: {
          list: get(options, 'config.Bootstrap',
            get(config, 'Bootstrap', []))
        }
      },
      relay: {
        enabled: get(options, 'relay.enabled',
          get(config, 'relay.enabled', true)),
        hop: {
          enabled: get(options, 'relay.hop.enabled',
            get(config, 'relay.hop.enabled', false)),
          active: get(options, 'relay.hop.active',
            get(config, 'relay.hop.active', false))
        }
      },
      dht: {
        kBucketSize: get(options, 'dht.kBucketSize', 20),
        enabled: !get(options, 'offline', false), // disable if offline, on by default
        randomWalk: {
          enabled: false // disabled waiting for https://github.com/libp2p/js-libp2p-kad-dht/issues/86
        },
        validators: {
          ipns: ipnsUtils.validator
        },
        selectors: {
          ipns: ipnsUtils.selector
        }
      },
      EXPERIMENTAL: {
        pubsub: get(options, 'EXPERIMENTAL.pubsub', false)
      }
    },
    connectionManager: get(options, 'connectionManager',
      {
        maxPeers: get(config, 'Swarm.ConnMgr.HighWater'),
        minPeers: get(config, 'Swarm.ConnMgr.LowWater')
      })
  }

  const libp2pOptions = mergeOptions(libp2pDefaults, get(options, 'libp2p', {}))

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const Node = require('../runtime/libp2p-nodejs')
  return new Node(libp2pOptions)
}

class DialQueue {
  constructor (libp2p, peerBook) {
    this._libp2p = libp2p
    this._peerBook = peerBook
    this._queue = new Set()
    this._blacklist = new Set()
    this._running = false

    setInterval(() => {
      log(this._queue.size, 'peers in dial queue')
    }, 10 * 1000)
  }

  _run () {
    // If already running or nothing in the queue...then return
    if (this._running || !this._queue.size) return
    this._running = true

    const cb = err => {
      if (err) log(err)

      // Keep processing the queue if not stopped
      if (this._queue.size) {
        return process.nextTick(() => {
          if (this._running) {
            this._dialNext(cb)
          }
        })
      }

      this._running = false
    }

    this._dialNext(cb)
  }

  _dialNext (cb) {
    log('dialing 1 of', this._queue.size)

    const peerId = this._queue.values().next().value
    this._queue.delete(peerId)

    if (this._blacklist.has(peerId)) {
      log('not dialing blacklisted', peerId)
      return cb()
    }

    const peerInfo = this._peerBook.get(peerId)

    if (peerInfo.isConnected()) {
      log('not dialing connected', peerId)
      return cb()
    }

    log('dialing', peerInfo.id.toB58String())
    this._libp2p.dial(peerInfo, err => {
      if (err) {
        if (err.code === 'CONNECTION_FAILED') {
          log('blacklisting', peerId)
          this._blacklist.add(peerId)
          return cb()
        }
        log('dial failed', peerId, err.code)
        return cb(err)
      }

      log('dialed', peerId)
      cb()
    })
  }

  start () {
    this._started = true
    this._run()
    return this
  }

  add (peerInfo) {
    peerInfo = this._peerBook.put(peerInfo)
    const peerId = peerInfo.id.toB58String()

    if (peerInfo.isConnected()) {
      log('not adding connected', peerId)
      return this
    }

    if (!this._queue.has(peerId)) {
      log('not adding queued', peerId)
      this._queue.add(peerId)
    }

    // Only process the queue if started
    if (this._started) {
      this._run()
    }

    return this
  }

  stop () {
    this._started = false
    this._running = false
    return this
  }
}
