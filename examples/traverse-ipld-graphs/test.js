'use strict'

const path = require('path')
const {
  waitForOutput
} = require('test-ipfs-example/utils')

async function runTest () {
  console.info('Testing put.js')
  await waitForOutput('bafyreigsccjrxlioppkkzv27se4gxh2aygbxfnsobkaxxqiuni544uk66a', path.resolve(__dirname, 'put.js'))

  console.info('Testing get.js')
  await waitForOutput('{"name":"David","likes":["js-ipfs","icecream","steak"]}', path.resolve(__dirname, 'get.js'))

  console.info('Testing get-path.js')
  await waitForOutput('js-ipfs', path.resolve(__dirname, 'get-path.js'))

  console.info('Testing get-path-accross-formats.js')
  await waitForOutput('capoeira', path.resolve(__dirname, 'get-path-accross-formats.js'))

  console.info('Done!')
}

module.exports = runTest
