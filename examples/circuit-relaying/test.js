'use strict'

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const execa = require('execa')
const delay = require('delay')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsModule: {
    path: require.resolve('../../src'),
    ref: require('../../src')
  },
  ipfsHttpModule: {
    path: require.resolve('ipfs-http-client'),
    ref: require('ipfs-http-client')
  }
})
const {
  startServer
} = require('../utils')
const pkg = require('./package.json')

async function testUI (url, relay, localPeerIdFile, remotePeerIdFile) {
  const proc = execa('nightwatch', [path.join(__dirname, 'test.js')], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_RELAY_ADDRESS: relay,
      IPFS_LOCAL_PEER_ID_FILE: localPeerIdFile,
      IPFS_REMOTE_PEER_ID_FILE: remotePeerIdFile
    },
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runTest () {
  const ipfsd = await df.spawn({
    type: 'proc',
    test: true,
    ipfsOptions: {
      relay: {
        enabled: true,
        hop: {
          enabled: true
        }
      },
      config: {
        Addresses: {
          Swarm: [
            '/ip4/127.0.0.1/tcp/0/ws'
          ]
        }
      }
    }
  })
  const server1 = await startServer(__dirname)
  const server2 = await startServer(__dirname)

  try {
    const id = await ipfsd.api.id()
    const address = id.addresses.filter(addr => addr.includes('/ws/ipfs/Qm')).pop()

    if (!address) {
      throw new Error(`Could not find web socket address in ${id.addresses}`)
    }

    const peerA = path.join(os.tmpdir(), `test-${Date.now()}-a.txt`)
    const peerB = path.join(os.tmpdir(), `test-${Date.now()}-b.txt`)

    await Promise.all([
      testUI(server1.url, id.addresses[0], peerA, peerB),
      testUI(server2.url, id.addresses[0], peerB, peerA)
    ])
  } finally {
    await ipfsd.stop()
    await server1.stop()
    await server2.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  let localPeerId = null
  let remotePeerId = null

  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#peer')
    .clearValue('#peer')
    .setValue('#peer', process.env.IPFS_RELAY_ADDRESS)
    .pause(1000)
    .click('#connect')

  browser.expect.element('#peers-addrs').text.to.contain(process.env.IPFS_RELAY_ADDRESS)

  // exchange peer info
  browser.getText('#addrs', (result) => {
    localPeerId = result.value.trim()
    console.info('got local peer id', localPeerId)
  })
    .perform(async (browser, done) => {
      console.info('writing local peer id')
      await fs.writeFile(process.env.IPFS_LOCAL_PEER_ID_FILE, localPeerId)

      console.info('reading remote peer id')
      for (let i = 0; i < 100; i++) {
        try {
          remotePeerId = await fs.readFile(process.env.IPFS_REMOTE_PEER_ID_FILE, {
            encoding: 'utf8'
          })

          console.info('got remote peer id', remotePeerId)
          done()

          break
        } catch (err) {
          // ignore
        }

        await delay(1000)
      }

      console.info('connecting to remote peer', remotePeerId)

      browser
        .clearValue('#peer')
        .setValue('#peer', remotePeerId)
        .pause(1000)
        .click('#connect')

      browser.expect.element('#peers-addrs').text.to.contain(remotePeerId)

      browser
        .clearValue('#message')
        .setValue('#message', 'hello')
        .pause(1000)
        .click('#send')

      browser.expect.element('#msgs').text.to.contain(`${remotePeerId.substr(-4)}: hello`)
      browser.expect.element('#msgs').text.to.contain(`${localPeerId.substr(-4)}: hello`)
    })

  browser.end()
}
