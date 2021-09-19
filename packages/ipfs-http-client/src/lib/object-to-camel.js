
/**
 * Convert object properties to camel case.
 * NOT recursive!
 * e.g.
 * AgentVersion => agentVersion
 * ID => id
 *
 * @param {Record<string, any>} obj
 */
export function objectToCamel (obj) {
  if (obj == null) {
    return obj
  }

  const caps = /^[A-Z]+$/

  /** @type {Record<string, any>} */
  const output = {}

  return Object.keys(obj).reduce((camelObj, k) => {
    if (caps.test(k)) { // all caps
      camelObj[k.toLowerCase()] = obj[k]
    } else if (caps.test(k[0])) { // pascal
      camelObj[k[0].toLowerCase() + k.slice(1)] = obj[k]
    } else {
      camelObj[k] = obj[k]
    }
    return camelObj
  }, output)
}
