'use strict'

const cp = require('./cp')
const flush = require('./flush')
const ls = require('./ls')
const mkdir = require('./mkdir')
const mv = require('./mv')
const read = require('./read')
const rm = require('./rm')
const stat = require('./stat')
const write = require('./write')

module.exports = (api) => {
  cp(api)
  flush(api)
  ls(api)
  mkdir(api)
  mv(api)
  read(api)
  rm(api)
  stat(api)
  write(api)
}
