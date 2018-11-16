'use strict'

const constants = require('./constants')

module.exports = {
  addLink: require('./add-link'),
  countStreamBytes: require('./count-stream-bytes'),
  createLock: require('./create-lock'),
  createNode: require('./create-node'),
  formatCid: require('./format-cid'),
  limitStreamBytes: require('./limit-stream-bytes'),
  loadNode: require('./load-node'),
  removeLink: require('./remove-link'),
  toMfsPath: require('./to-mfs-path'),
  toPathComponents: require('./to-path-components'),
  toPullSource: require('./to-pull-source'),
  toSourcesAndDestination: require('./to-sources-and-destination'),
  toSources: require('./to-sources'),
  toTrail: require('./to-trail'),
  updateMfsRoot: require('./update-mfs-root'),
  updateTree: require('./update-tree'),
  withMfsRoot: require('./with-mfs-root'),
  zeros: require('./zeros'),

  FILE_SEPARATOR: constants.FILE_SEPARATOR,
  MAX_CHUNK_SIZE: constants.MAX_CHUNK_SIZE,
  MAX_LINKS: constants.MAX_LINKS,
  FILE_TYPES: constants.FILE_TYPES
}
