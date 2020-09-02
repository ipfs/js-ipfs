'use strict'

const http = require('http')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const execa = require('execa')
const delay = require('delay')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsModule: require('ipfs'),
  ipfsHttpModule: require('ipfs-http-client')
}, {
  js: {
    ipfsBin: require.resolve('ipfs/src/cli/bin.js')
  }
})
const {
  startServer
} = require('test-ipfs-example/utils')
const pkg = require('./package.json')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')

const FILE_CONTENT = 'A file with some content'

async function testUI (env) {
  const proc = execa(require.resolve('test-ipfs-example/node_modules/.bin/nightwatch'), [ '--config', require.resolve('test-ipfs-example/nightwatch.conf.js'),  path.join(__dirname, 'test.js') ], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      ...env,
      CI: true
    },
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runTest () {
  const sigServer = await webRTCStarSigServer.start({
    host: '127.0.0.1',
    port: 13579
  })

  const relay = await df.spawn({
    type: 'js',
    ipfsOptions: {
      config: {
        Addresses: {
          Swarm: [
            '/ip4/127.0.0.1/tcp/0/ws'
          ]
        }
      }
    }
  })

  const { cid } = await relay.api.add(FILE_CONTENT)

  const server1 = await startServer(__dirname)
  const server2 = await startServer(__dirname)

  try {
    const id = await relay.api.id()
    const address = id.addresses
      .map(ma => ma.toString())
      .find(addr => addr.includes('/ws/p2p'))

    if (!address) {
      throw new Error(`Could not find web socket address in ${id.addresses}`)
    }

    const workspaceName = `test-${Math.random()}`
    const peerA = path.join(os.tmpdir(), `test-${Date.now()}-a.txt`)
    const peerB = path.join(os.tmpdir(), `test-${Date.now()}-b.txt`)

    console.info('Relay address', address)

    await Promise.all([
      testUI({
        IPFS_EXAMPLE_TEST_URL: server1.url,
        IPFS_RELAY_ADDRESS: address,
        IPFS_CID: cid,
        IPFS_WORKSPACE_NAME: workspaceName,
        IPFS_ADD_FILE: true,
        IPFS_LOCAL_PEER_ID_FILE: peerA,
        IPFS_REMOTE_PEER_ID_FILE: peerB
      }),
      testUI({
        IPFS_EXAMPLE_TEST_URL: server1.url,
        IPFS_RELAY_ADDRESS: address,
        IPFS_CID: cid,
        IPFS_WORKSPACE_NAME: workspaceName,
        IPFS_LOCAL_PEER_ID_FILE: peerB,
        IPFS_REMOTE_PEER_ID_FILE: peerA
      })
    ])
  } finally {
    await server2.stop()
    await server1.stop()
    await relay.stop()
    await sigServer.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  let localPeerId = null
  let remotePeerId = null

  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#connected-peers tr td')
    .pause(1000)

  console.info('dialling relay', process.env.IPFS_RELAY_ADDRESS)

  browser
    .clearValue('#multiaddr-input')
    .setValue('#multiaddr-input', process.env.IPFS_RELAY_ADDRESS)
    .pause(1000)
    .click('#peer-btn')

  const relayPeerId = process.env.IPFS_RELAY_ADDRESS.split('/').pop()

  browser.expect.element('#connected-peers').text.to.contain(relayPeerId)

  console.info('joining workspace', process.env.IPFS_WORKSPACE_NAME)

  browser
    .clearValue('#workspace-input')
    .setValue('#workspace-input', process.env.IPFS_WORKSPACE_NAME)
    .pause(1000)
    .click('#workspace-btn')

  // exchange peer info
  browser.getText('.node-id', (result) => {
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

        }

        await delay(1000)
      }

      console.info('waiting for remote peer', remotePeerId, 'to join workspace')
      browser.expect.element('#workspace-peers').text.to.contain(remotePeerId)

      await delay(1000)
    })

  // only one browser should add the file to the workspace
  if (process.env.IPFS_ADD_FILE) {
    browser
      .clearValue('#cid-input')
      .setValue('#cid-input', process.env.IPFS_CID)
      .pause(1000)
      .click('#fetch-btn')
  }

  browser.pause(1000)

  // but should both see the added file
  browser.expect.element('#file-history').text.to.contain(process.env.IPFS_CID)

  if (!process.env.IPFS_ADD_FILE) {
    // download the file from the other browser
    browser
      .getAttribute(`a[download=${process.env.IPFS_CID}]`, 'href', ({ value: url }) => {
        browser.executeAsync(function (url, done) {
          fetch(url)
            .then(res => res.text())
            .then(done, done)
        }, [ url ], ({ value: contents }) => {
          browser.expect(contents).to.equal(FILE_CONTENT)
        })
      })
  }

  browser.end()
}
