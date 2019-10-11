'use strict'

const IPFS = require('ipfs')

const execa = require('execa')
const os = require('os')
const path = require('path')
const hat = require('hat')
const {
  ephemeralPort,
  waitForOutput
} = require('../utils')

async function  testCli () {
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
  await execa(ipfs, ['config', 'Addresses.Swarm', '--json', JSON.stringify([`/ip4/0.0.0.0/tcp/${ephemeralPort()}`, `/ip4/127.0.0.1/tcp/${ephemeralPort()}/ws`])], opts)
  await execa(ipfs, ['config', 'Addresses.API', `/ip4/127.0.0.1/tcp/${ephemeralPort()}`], opts)
  await execa(ipfs, ['config', 'Addresses.Gateway', `/ip4/127.0.0.1/tcp/${ephemeralPort()}`], opts)

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
  const node = new IPFS({
    repo: repoDir,
    config: {
      Addresses: {
        Swarm: [
          `/ip4/0.0.0.0/tcp/${ephemeralPort()}`,
          `/ip4/127.0.0.1/tcp/${ephemeralPort()}/ws`
        ],
        API: `/ip4/127.0.0.1/tcp/${ephemeralPort()}`,
        Gateway: `/ip4/127.0.0.1/tcp/${ephemeralPort()}`
      },
      Bootstrap: []
    }
  })

  console.info('Initialising programmatic node')
  await node.init()
  console.info('Starting programmatic node')
  await node.start()
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
