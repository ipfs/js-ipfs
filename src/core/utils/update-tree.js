'use strict'

const doWhilst = require('async/doWhilst')
const addLink = require('./add-link')

const updateTree = (ipfs, child, callback) => {
  doWhilst(
    (next) => {
      if (!child.parent) {
        const lastChild = child
        child = null
        return next(null, lastChild)
      }

      addLink(ipfs, {
        parent: child.parent.node,
        child: child.node,
        name: child.name,
        flush: true
      }, (error, updatedParent) => {
        child.parent.node = updatedParent

        const lastChild = child
        child = child.parent

        next(error, lastChild)
      })
    },
    () => Boolean(child),
    callback
  )
}

module.exports = updateTree
