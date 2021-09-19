/**
 * @param {any} obj
 * @returns {obj is ArrayBufferView|ArrayBuffer}
 */
export function isBytes (obj) {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

/**
 * @param {any} obj
 * @returns {obj is globalThis.Blob}
 */
export function isBlob (obj) {
  return obj.constructor &&
    (obj.constructor.name === 'Blob' || obj.constructor.name === 'File') &&
    typeof obj.stream === 'function'
}

/**
 * An object with a path or content property
 *
 * @param {any} obj
 * @returns {obj is import('ipfs-core-types/src/utils').ImportCandidate}
 */
export function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
}

/**
 * @param {any} value
 * @returns {value is ReadableStream}
 */
export const isReadableStream = (value) =>
  value && typeof value.getReader === 'function'
