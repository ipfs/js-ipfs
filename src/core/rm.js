'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')
const {
  updateTree,
  updateMfsRoot,
  toSources,
  removeLink,
  toMfsPath,
  toTrail,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  format: 'dag-pb'
}

module.exports = (context) => {
  return function mfsRm () {
    const args = Array.from(arguments)
    const callback = args.pop()

    waterfall([
      (cb) => toSources(context, args, defaultOptions, cb),
      ({ sources, options }, cb) => {
        if (!sources.length) {
          return cb(new Error('Please supply at least one path to remove'))
        }

        series(
          sources.map(source => {
            return (done) => removePath(context, source.path, options, done)
          }),
          (error) => cb(error)
        )
      }
    ], callback)
  }
}

const removePath = (context, path, options, callback) => {
  if (path === FILE_SEPARATOR) {
    return callback(new Error('Cannot delete root'))
  }

  waterfall([
    (cb) => toMfsPath(context, path, cb),
    ({ mfsPath, parts }, cb) => toTrail(context, mfsPath, options, (err, trail) => cb(err, { mfsPath, parts, trail })),
    ({ trail }, cb) => {
      const child = trail.pop()
      const parent = trail[trail.length - 1]

      if (!parent) {
        return cb(new Error(`${path} does not exist`))
      }

      if (child.type === 'dir' && !options.recursive) {
        return cb(new Error(`${path} is a directory, use -r to remove directories`))
      }

      waterfall([
        (done) => removeLink(context, {
          parentCid: parent.cid,
          name: child.name
        }, done),
        ({ cid }, done) => {
          parent.cid = cid

          done(null, trail)
        }
      ], cb)
    },

    // update the tree with the new child
    (trail, cb) => updateTree(context, trail, options, cb),

    // Update the MFS record with the new CID for the root of the tree
    ({ cid }, cb) => updateMfsRoot(context, cid, cb)
  ], callback)
}
