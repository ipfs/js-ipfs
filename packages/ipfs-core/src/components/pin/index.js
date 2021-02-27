'use strict'

const add = require('./add')
const addAll = require('./add-all')
const ls = require('./ls')
const rm = require('./rm')
const rmAll = require('./rm-all')

/**
 * @typedef {import('cids')} CID
 * @typedef {Object} Context
 * @property {import('..').GCLock} gcLock
 * @property {import('..').DagReader} dagReader
 * @property {import('..').PinManager} pinManager
 */

/**
 * @typedef {import('ipfs-core-types/src/pin').API} API
 * @implements {API}
 */
class PinAPI {
  constructor ({ gcLock, dagReader, pinManager }) {
    this.gcLock = gcLock
    this.dagReader = dagReader
    this.pinManager = pinManager
  }

  /**
   * Adds an IPFS object to the pinset and also stores it to the IPFS repo.
   * pinset is the set of hashes currently pinned (not gc'able)
   *
   * @param {CID|string} source
   * @param {import('ipfs-core-types/src/pin').AddOptions} [options]
   */

  add (source, options) {
    return add(this, source, options)
  }

  /**
   * Adds multiple IPFS objects to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * for await (const cid of ipfs.pin.addAll([cid])) {
   * console.log(cid)
   * }
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   *
   * @param {import('ipfs-core-types/src/pin').PinSource} source - One or more CIDs or IPFS Paths to pin in your repo
   * @param {import('ipfs-core-types/src/pin').AddAllOptions} [options]
   */
  addAll (source, options) {
    return addAll(this, source, options)
  }

  /**
   * Unpin this block from your repo
   *
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const result = await ipfs.pin.rm(cid)
   * console.log(result)
   * // prints the CID that was unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   *
   * @param {CID|string} source
   * @param {import('ipfs-core-types/src/pin').RemoveOptions} [options]
   */
  rm (source, options) {
    return rm(this, source, options)
  }

  /**
   * Unpin one or more blocks from your repo
   *
   * @example
   * ```js
   * const source = [
   * CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ]
   * for await (const cid of ipfs.pin.rmAll(source)) {
   * console.log(cid)
   * }
   * // prints the CIDs that were unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   *
   * @param {import('ipfs-core-types/src/pin').PinSource} source
   * @param {import('ipfs-core-types/src/pin').RemoveAllOptions} [options]
   */
  rmAll (source, options) {
    return rmAll(this, source, options)
  }

  /**
   * List all the objects pinned to local storage
   *
   * @example
   * ```js
   * for await (const { cid, type } of ipfs.pin.ls()) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   *
   * const paths = [
   *   CID.from('Qmc5..'),
   *   CID.from('QmZb..'),
   *   CID.from('QmSo..')
   * ]
   * for await (const { cid, type } of ipfs.pin.ls({ paths })) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   * ```
   *
   * @param {import('ipfs-core-types/src/pin').ListOptions} [options]
   */
  ls (options) {
    return ls(this, options)
  }
}
module.exports = PinAPI
