'use strict'

let testCore = true
let testHTTP = true
let testCLI = true

if (process.env.TEST) {
  switch (process.env.TEST) {
    case 'core': {
      testHTTP = false
      testCLI = false
    } break
    case 'http': {
      testCore = false
      testCLI = false
    } break
    case 'cli': {
      testCore = false
      testCLI = false
    } break
    default: break
  }
}

if (testCore) {
  require('./core-tests')
}

if (testHTTP) {
  require('./http-api-tests')
}

if (testCLI) {
  require('./cli-tests')
}
