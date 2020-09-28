'use strict'

const chmod = require('./chmod')
const cp = require('./cp')
const flush = require('./flush')
const ls = require('./ls')
const mkdir = require('./mkdir')
const mv = require('./mv')
const read = require('./read')
const rm = require('./rm')
const stat = require('./stat')
const touch = require('./touch')
const write = require('./write')

module.exports = {
  chmod,
  cp,
  flush,
  ls,
  mkdir,
  mv,
  read,
  rm,
  stat,
  touch,
  write
}
