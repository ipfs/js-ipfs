'use strict'

/* eslint-env browser */

/**
 * @typedef {import('ipfs-core-types').AbortOptions} AbortOptions
 * @typedef {import('./cid').CID} CID
 * @typedef {import('./cid').EncodedCID} EncodedCID
 */

/**
 * @template T
 * @typedef {import('./core').RemoteIterable<T>} RemoteIterable
 */

/**
 * @typedef {'direct'|'recursive'|'indirect'} PinType
 * @typedef {PinType|'all'} PinQueryType
 *
 * @typedef {Object} Pin
 * @property {string|CID} path
 * @property {boolean} [recursive]
 * @property {any} [metadata]
 *
 * @typedef {Object} EncodedPin
 * @property {string|EncodedCID} path
 * @property {boolean} [recursive]
 * @property {any} [metadata]
 *
 * @typedef {Pin|AsyncIterable<Pin>} Source
 * @typedef {EncodedPin|RemoteIterable<EncodedPin>} EncodedSource
 */

/**
 * @typedef {LsSettings & AbortOptions} LsOptions
 *
 * @typedef {Object} LsSettings
 * @property {Array<string|CID>|string|CID} [paths]
 * @property {number} [timeout]
 * @property {PinType} [type]
 *
 * @typedef {Object} LsEntry
 * @property {CID} cid
 * @property {PinType} type
 * @property {any} [metadata]
 *
 * @typedef {Object} EncodedLsEntry
 * @property {EncodedCID} cid
 * @property {PinType} type
 * @property {any} [metadata]
 */

// trigger type exports
exports.default = {}
