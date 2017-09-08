'use strict'

let testCore = true
let testHTTP = true
let testCLI = true
let testGatway = true

if (process.env.TEST) {
  switch (process.env.TEST) {
    case 'core':
      testHTTP = false
      testCLI = false
      break
    case 'http':
      testCore = false
      testCLI = false
      break
    case 'gateway':
      testCore = false
      testCLI = false
      testHTTP = false
      break
    case 'cli':
      testCore = false
      testHTTP = false
      break
    default:
      break
  }
}

if (testCore) {
  // require('./core/node')
}

if (testHTTP) {
  require('./http-api')
}

if (testCLI) {
  require('./cli')
}

if (testGatway) {
  require('./gateway')
}
