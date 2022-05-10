import * as ipns from 'ipns'
import { importKey } from '@libp2p/crypto/keys'
import { isPeerId } from '@libp2p/interfaces/peer-id'
import errcode from 'err-code'
import { logger } from '@libp2p/logger'
import { peerIdFromKeys } from '@libp2p/peer-id'

const log = logger('ipfs:ipns:republisher')

/**
 * @typedef {import('@libp2p/interfaces/keys').PrivateKey} PrivateKey
 * @typedef {import('@libp2p/interfaces/peer-id').PeerId} PeerId
 */

const minute = 60 * 1000
const hour = 60 * minute

const defaultBroadcastInterval = 4 * hour
const defaultRecordLifetime = 24 * hour

export class IpnsRepublisher {
  /**
   * @param {import('./publisher').IpnsPublisher} publisher
   * @param {import('interface-datastore').Datastore} datastore
   * @param {PeerId} peerId
   * @param {import('@libp2p/interfaces/keychain').KeyChain} keychain
   * @param {object} options
   * @param {string} options.pass
   * @param {number} [options.initialBroadcastInterval]
   * @param {number} [options.broadcastInterval]
   */
  constructor (publisher, datastore, peerId, keychain, options = { pass: '' }) {
    this._publisher = publisher
    this._datastore = datastore
    this._peerId = peerId
    this._keychain = keychain
    this._options = options
    this._republishHandle = null
  }

  async start () { // eslint-disable-line require-await
    if (this._republishHandle) {
      throw errcode(new Error('republisher is already running'), 'ERR_REPUBLISH_ALREADY_RUNNING')
    }

    // TODO: this handler should be isolated in another module
    const republishHandle = {
      /** @type {null|(() => Promise<void>)} */
      _task: null,
      /** @type {null|Promise<void>} */
      _inflightTask: null,
      /** @type {null|NodeJS.Timeout} */
      _timeoutId: null,
      /**
       * @param {function(): number} period
       */
      runPeriodically: (period) => {
        republishHandle._timeoutId = setTimeout(async () => {
          republishHandle._timeoutId = null

          try {
            // @ts-expect-error - _task could be null
            republishHandle._inflightTask = republishHandle._task()
            await republishHandle._inflightTask

            // Schedule next
            if (republishHandle._task) {
              republishHandle.runPeriodically(period)
            }
          } catch (/** @type {any} */ err) {
            log.error(err)
          }
        }, period())
      },
      cancel: async () => {
        // do not run again
        if (republishHandle._timeoutId != null) {
          clearTimeout(republishHandle._timeoutId)
        }
        republishHandle._task = null

        // wait for the currently in flight task to complete
        await republishHandle._inflightTask
      }
    }

    const { pass } = this._options
    let firstRun = true

    republishHandle._task = () => this._republishEntries(this._peerId, pass)

    republishHandle.runPeriodically(() => {
      if (firstRun) {
        firstRun = false
        return this._options.initialBroadcastInterval || minute
      }

      return this._options.broadcastInterval || defaultBroadcastInterval
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

  /**
   * @param {PeerId} peerId
   * @param {string} pass
   */
  async _republishEntries (peerId, pass) {
    // TODO: Should use list of published entries.
    // We can't currently *do* that because go uses this method for now.
    try {
      await this._republishEntry(peerId)
    } catch (/** @type {any} */ err) {
      const errMsg = 'cannot republish entry for the node\'s private key'

      log.error(errMsg)
      return
    }

    // keychain needs pass to get the cryptographic keys
    if (pass) {
      try {
        const keys = await this._keychain.listKeys()

        for (const key of keys) {
          if (key.name === 'self') {
            continue
          }

          const pem = await this._keychain.exportKey(key.name, pass)
          const privKey = await importKey(pem, pass)
          const peerIdKey = await peerIdFromKeys(privKey.public.bytes, privKey.bytes)

          await this._republishEntry(peerIdKey)
        }
      } catch (/** @type {any} */ err) {
        log.error(err)
      }
    }
  }

  /**
   * @param {PeerId} peerId
   */
  async _republishEntry (peerId) {
    try {
      const value = await this._getPreviousValue(peerId)
      await this._publisher.publishWithEOL(peerId, value, defaultRecordLifetime)
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_NO_ENTRY_FOUND') {
        return
      }

      throw err
    }
  }

  /**
   * @param {PeerId} peerId
   */
  async _getPreviousValue (peerId) {
    if (!(isPeerId(peerId))) {
      throw errcode(new Error('invalid peer ID'), 'ERR_INVALID_PEER_ID')
    }

    try {
      const dsVal = await this._datastore.get(ipns.getLocalKey(peerId.toBytes()))

      if (!(dsVal instanceof Uint8Array)) {
        throw errcode(new Error("found ipns record that we couldn't process"), 'ERR_INVALID_IPNS_RECORD')
      }

      // unmarshal data
      try {
        const record = ipns.unmarshal(dsVal)

        return record.value
      } catch (/** @type {any} */ err) {
        log.error(err)
        throw errcode(new Error('found ipns record that we couldn\'t convert to a value'), 'ERR_INVALID_IPNS_RECORD')
      }
    } catch (/** @type {any} */ err) {
      // error handling
      // no need to republish
      if (err && err.notFound) {
        throw errcode(new Error(`no previous entry for record with id: ${peerId.toString()}`), 'ERR_NO_ENTRY_FOUND')
      }

      throw err
    }
  }
}
