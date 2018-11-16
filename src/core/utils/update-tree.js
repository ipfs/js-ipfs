'use strict'

const waterfall = require('async/waterfall')
const reduceRight = require('async/reduceRight')
const addLink = require('./add-link')

const defaultOptions = {
  shardSplitThreshold: 1000
}

const updateTree = (context, trail, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  waterfall([
    (cb) => context.ipld.getMany(trail.map(node => node.cid), cb),
    (nodes, cb) => {
      let index = trail.length - 1

      reduceRight(trail, null, (child, node, done) => {
        const dagNode = nodes[index]
        const cid = trail[index].cid
        index--

        if (!child) {
          // first item in the list
          return done(null, node)
        }

        addLink(context, {
          parent: dagNode,
          parentCid: cid,
          name: child.name,
          cid: child.cid,
          size: child.size,
          flush: options.flush,
          shardSplitThreshold: options.shardSplitThreshold
        }, (err, result) => {
          if (err) {
            return done(err)
          }

          done(err, {
            cid: result.cid,
            node: result.node,
            name: node.name,
            size: result.node.size
          })
        })
      }, cb)
    }
  ], callback)
}

module.exports = updateTree
