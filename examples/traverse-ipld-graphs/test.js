'use strict'

const path = require('path')
const {
  waitForOutput
} = require('../utils')

async function runTest () {
  console.info('Testing put.js')
  await waitForOutput('bafyreigsccjrxlioppkkzv27se4gxh2aygbxfnsobkaxxqiuni544uk66a', path.resolve(__dirname, 'put.js'))

  console.info('Testing get.js')
  await waitForOutput('{"name":"David","likes":["js-ipfs","icecream","steak"]}', path.resolve(__dirname, 'get.js'))

  console.info('Testing get-path.js')
  await waitForOutput('js-ipfs', path.resolve(__dirname, 'get-path.js'))

  console.info('Testing get-path-accross-formats.js')
  await waitForOutput('capoeira', path.resolve(__dirname, 'get-path-accross-formats.js'))

  console.info('Testing tree.js')
  await waitForOutput("hobbies/0/Links", path.resolve(__dirname, 'tree.js'))

  console.info('Testing eth.js')
  await waitForOutput('302516', path.resolve(__dirname, 'eth.js'))

  console.info('Testing git.js')
  await waitForOutput("'hello world!'", path.resolve(__dirname, 'git.js'))

  console.info('Done!')
}

module.exports = runTest
