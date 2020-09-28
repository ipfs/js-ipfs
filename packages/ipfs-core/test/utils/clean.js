'use strict'

const rimraf = require('rimraf')
const fs = require('fs').promises
const { promisify } = require('util')

module.exports = async dir => {
  try {
    await fs.access(dir)
  } catch (err) {
    // Does not exist so all good
    return
  }

  return promisify(rimraf)(dir)
}
