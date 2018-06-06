'use strict'

const isWebWorker = require('detect-webworker')

if (isWebWorker) {
  // https://github.com/Joris-van-der-Wel/karma-mocha-webworker/issues/4
  global.MFS_DISABLE_CONCURRENCY = true
}

require('./cp.spec.js')
require('./flush.spec.js')
require('./ls.spec.js')
require('./mkdir.spec.js')
require('./mv.spec.js')
require('./read.spec.js')
require('./rm.spec.js')
require('./stat.spec.js')
require('./write.spec.js')
