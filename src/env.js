'use strict'
const isElectron = require('is-electron')

const IS_ENV_WITH_DOM = typeof window === 'object' && typeof document === 'object' && document.nodeType === 9
const IS_ELECTRON = isElectron()
const IS_BROWSER = IS_ENV_WITH_DOM && !IS_ELECTRON
const IS_ELECTRON_RENDERER = IS_ELECTRON && IS_ENV_WITH_DOM
const IS_NODE = typeof require === 'function' && typeof process !== 'undefined' && typeof process.release !== 'undefined' && process.release.name === 'node' && !IS_ELECTRON
// eslint-disable-next-line no-undef
const IS_WEBWORKER = typeof importScripts === 'function' && typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope

module.exports = {
  isElectron: IS_ELECTRON,
  isElectronRenderer: IS_ELECTRON_RENDERER,
  isNode: IS_NODE,
  /**
   * Detects browser main thread  **NOT** web worker or service worker
   */
  isBrowser: IS_BROWSER,
  isWebWorker: IS_WEBWORKER,
  isEnvWithDom: IS_ENV_WITH_DOM
}
