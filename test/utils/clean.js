'use strict'

const rimraf = require('rimraf')
const fs = require('fs')

module.exports = (dir) => {
  try {
    fs.accessSync(dir)
  } catch (err) {
    // Does not exist so all good
    return
  }

  rimraf.sync(dir)
}
