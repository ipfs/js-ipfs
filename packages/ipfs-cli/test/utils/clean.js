

import rimraf from 'rimraf'
import { promises as fs } from 'fs'
import { promisify } from 'util'

module.exports = async dir => {
  try {
    await fs.access(dir)
  } catch (/** @type {any} */ err) {
    // Does not exist so all good
    return
  }

  return promisify(rimraf)(dir)
}
