'use strict'

const IPFS = require('../../')

const execa = require('execa')
const os = require('os')
const path = require('path')
const hat = require('hat')
const {
  waitForOutput
} = require('../utils')

async function testCli () {
  await Promise.all([
    startCliNode(),
    startCliNode()
  ])
}

async function startCliNode () {
  const repoDir = path.join(os.tmpdir(), `repo-${hat()}`)
  const opts = {
    env: {
      ...process.env,
      IPFS_PATH: repoDir
    }
  }
  const ipfs = path.resolve(__dirname, '../../src/cli/bin.js')

  await execa(ipfs, ['init'], opts)
  await execa(ipfs, ['config', 'Addresses.Swarm', '--json', JSON.stringify([`/ip4/0.0.0.0/tcp/0`, `/ip4/127.0.0.1/tcp/0/ws`])], opts)
  await execa(ipfs, ['config', 'Addresses.API', `/ip4/127.0.0.1/tcp/0`], opts)
  await execa(ipfs, ['config', 'Addresses.Gateway', `/ip4/127.0.0.1/tcp/0`], opts)

  return waitForOutput('Daemon is ready', ipfs, ['daemon'], opts)
}

async function testProgramatically () {
  await Promise.all([
    startProgramaticNode(),
    startProgramaticNode()
  ])
}

async function startProgramaticNode () {
  const repoDir = path.join(os.tmpdir(), `repo-${hat()}`)
  const node = await IPFS.create({
    repo: repoDir,
    config: {
      Addresses: {
        Swarm: [
          `/ip4/0.0.0.0/tcp/0`,
          `/ip4/127.0.0.1/tcp/0/ws`
        ],
        API: `/ip4/127.0.0.1/tcp/0`,
        Gateway: `/ip4/127.0.0.1/tcp/0`
      },
      Bootstrap: []
    }
  })

  console.info('Stopping programmatic node')
  await node.stop()
}

async function runTest () {
  console.info('Testing CLI recipe')
  await testCli()
  console.info('Testing Programmatic recipe')
  await testProgramatically()
  console.info('Done!')
}

module.exports = runTest
