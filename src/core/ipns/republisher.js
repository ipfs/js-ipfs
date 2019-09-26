'use strict'

const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const errcode = require('err-code')
const promisify = require('promisify-es6')

const debug = require('debug')
const log = debug('ipfs:ipns:republisher')
log.error = debug('ipfs:ipns:republisher:error')

const minute = 60 * 1000
const hour = 60 * minute

const defaultBroadcastInterval = 4 * hour
const defaultRecordLifetime = 24 * hour

class IpnsRepublisher {
  constructor (publisher, datastore, peerInfo, keychain, options) {
    this._publisher = publisher
    this._datastore = datastore
    this._peerInfo = peerInfo
    this._keychain = keychain
    this._options = options
    this._republishHandle = null
  }

  start () {
    if (this._republishHandle) {
      throw errcode(new Error('republisher is already running'), 'ERR_REPUBLISH_ALREADY_RUNNING')
    }

    // TODO: this handler should be isolated in another module
    const republishHandle = {
      _task: null,
      _inflightTask: null,
      _timeoutId: null,
      runPeriodically: (period) => {
        republishHandle._timeoutId = setTimeout(async () => {
          republishHandle._timeoutId = null

          try {
            republishHandle._inflightTask = republishHandle._task()
            await republishHandle._inflightTask

            // Schedule next
            if (republishHandle._task) {
              republishHandle.runPeriodically(period)
            }
          } catch (err) {
            log.error(err)
          }
        }, period())
      },
      cancel: async () => {
        // do not run again
        clearTimeout(republishHandle._timeoutId)
        republishHandle._task = null

        // wait for the currently in flight task to complete
        await republishHandle._inflightTask
      }
    }

    const { privKey } = this._peerInfo.id
    const { pass } = this._options
    let firstRun = true

    republishHandle._task = async () => {
      await this._republishEntries(privKey, pass)

      return defaultBroadcastInterval
    }
    republishHandle.runPeriodically(() => {
      if (firstRun) {
        firstRun = false

        return minute
      }

      return defaultBroadcastInterval
    })

    this._republishHandle = republishHandle
  }

  async stop () {
    const republishHandle = this._republishHandle

    if (!republishHandle) {
      throw errcode(new Error('republisher is not running'), 'ERR_REPUBLISH_NOT_RUNNING')
    }

    this._republishHandle = null

    await republishHandle.cancel()
  }

  async _republishEntries (privateKey, pass) {
    // TODO: Should use list of published entries.
    // We can't currently *do* that because go uses this method for now.
    try {
      await this._republishEntry(privateKey)
    } catch (err) {
      const errMsg = 'cannot republish entry for the node\'s private key'

      log.error(errMsg)
      return
    }

    // keychain needs pass to get the cryptographic keys
    if (pass) {
      try {
        const keys = await this._keychain.listKeys()

        for (const key in keys) {
          const pem = await this._keychain.exportKey(key.name, pass)
          const privKey = await crypto.keys.import(pem, pass)

          await this._republishEntry(privKey)
        }
      } catch (err) {
        log.error(err)
      }
    }
  }

  async _republishEntry (privateKey) {
    if (!privateKey || !privateKey.bytes) {
      throw errcode(new Error('invalid private key'), 'ERR_INVALID_PRIVATE_KEY')
    }

    try {
      const peerId = await promisify(PeerId.createFromPrivKey)(privateKey.bytes)
      const value = await this._getPreviousValue(peerId)
      await this._publisher.publishWithEOL(privateKey, value, defaultRecordLifetime)
    } catch (err) {
      if (err.code === 'ERR_NO_ENTRY_FOUND') {
        return
      }

      throw err
    }
  }

  async _getPreviousValue (peerId) {
    if (!(PeerId.isPeerId(peerId))) {
      throw errcode(new Error('invalid peer ID'), 'ERR_INVALID_PEER_ID')
    }

    try {
      const dsVal = await this._datastore.get(ipns.getLocalKey(peerId.id))

      if (!Buffer.isBuffer(dsVal)) {
        throw errcode(new Error("found ipns record that we couldn't process"), 'ERR_INVALID_IPNS_RECORD')
      }

      // unmarshal data
      try {
        const record = ipns.unmarshal(dsVal)

        return record.value
      } catch (err) {
        log.error(err)
        throw errcode(new Error('found ipns record that we couldn\'t convert to a value'), 'ERR_INVALID_IPNS_RECORD')
      }
    } catch (err) {
      // error handling
      // no need to republish
      if (err && err.notFound) {
        throw errcode(new Error(`no previous entry for record with id: ${peerId.id}`), 'ERR_NO_ENTRY_FOUND')
      }

      throw err
    }
  }
}

exports = module.exports = IpnsRepublisher
