'use strict'

const doWhilst = require('async/doWhilst')
const addLink = require('./add-link')

const updateTree = (context, child, callback) => {
  doWhilst(
    (next) => {
      if (!child.parent) {
        const previousChild = child
        child = null

        return next(null, {
          node: previousChild.node,
          cid: previousChild.cid
        })
      }

      addLink(context, {
        parent: child.parent.node,
        size: child.node.size,
        cid: child.cid,
        name: child.name,
        flush: true
      }, (error, result) => {
        if (error) {
          return next(error)
        }

        child.parent.node = result.node
        child.parent.cid = result.cid

        const previousChild = child
        child = child.parent

        next(null, {
          node: previousChild.node,
          cid: previousChild.cid
        })
      })
    },
    () => Boolean(child),
    callback
  )
}

module.exports = updateTree
