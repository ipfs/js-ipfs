import { objectToCamel } from './object-to-camel.js'

/**
 * @param {Record<string, any>} entry
 */
export function objectToCamelWithMetadata (entry) {
  const file = objectToCamel(entry)

  if (Object.prototype.hasOwnProperty.call(file, 'mode')) {
    file.mode = parseInt(file.mode, 8)
  }

  if (Object.prototype.hasOwnProperty.call(file, 'mtime')) {
    file.mtime = {
      secs: file.mtime,
      nsecs: file.mtimeNsecs || 0
    }

    delete file.mtimeNsecs
  }

  return file
}
