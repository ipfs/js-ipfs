
/**
 * @param {string} [path]
 */
export function toPathComponents (path = '') {
  // split on / unless escaped with \
  return (path
    .trim()
    .match(/([^\\^/]|\\\/)+/g) || [])
    .filter(Boolean)
}
