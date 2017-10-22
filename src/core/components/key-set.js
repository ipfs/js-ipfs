'use strict'

const multihashes = require('multihashes')

module.exports = function KeySet (keys) {
  // Buffers with identical data are still different objects, so
  // they need to be cast to strings to prevent duplicates in Sets
  this.keys = {}
  this.add = (key) => {
    this.keys[multihashes.toB58String(key)] = key
  }
  this.delete = (key) => {
    delete this.keys[multihashes.toB58String(key)]
  }
  this.clear = () => {
    this.keys = {}
  }
  this.has = (key) => {
    return (multihashes.toB58String(key) in this.keys)
  }
  this.toArray = () => {
    return Object.keys(this.keys).map((hash) => {
      return this.keys[hash]
    })
  }
  this.toStringArray = () => {
    return Object.keys(this.keys)
  }
  keys = keys || []
  keys.forEach(this.add)
}
