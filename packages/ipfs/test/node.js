'use strict'

const SegfaultHandler = require('segfault-handler')

SegfaultHandler.registerHandler('crash.log', function (signal, address, stack) {
  console.error('========= SEGFAULT =========') // eslint-disable-line no-console
  console.error('signal', signal) // eslint-disable-line no-console
  console.error('address', address) // eslint-disable-line no-console
  console.error('stack', stack) // eslint-disable-line no-console
})

require('./cli')
require('./http-api')
require('./gateway')
require('./core/node.js')
