'use strict'

const toPathComponents = require('../../src/core/utils/to-path-components')

module.exports = async (path, mfs) => {
  const parts = toPathComponents(path)
  const fileName = parts.pop()
  const directory = `/${parts.join('/')}`
  const files = []

  for await (const file of mfs.ls(directory, {
    long: true
  })) {
    files.push(file)
  }

  const file = files
    .filter(file => file.name === fileName)
    .pop()

  return file.cid
}
