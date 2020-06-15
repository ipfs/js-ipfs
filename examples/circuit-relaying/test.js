'use strict'

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const execa = require('execa')
const delay = require('delay')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsModule: require('ipfs'),
  ipfsHttpModule: require('ipfs-http-client')
})
const {
  startServer
} = require('test-ipfs-example/utils')
const pkg = require('./package.json')

async function testUI (url, relayAddr, relayId, localPeerIdFile, remotePeerIdFile) {
  const proc = execa(require.resolve('test-ipfs-example/node_modules/.bin/nightwatch'), ['--config', require.resolve('test-ipfs-example/nightwatch.conf.js'), path.join(__dirname, 'test.js')], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_RELAY_ADDRESS: relayAddr,
      IPFS_RELAY_ID: relayId,
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
    const address = id.addresses
      .map(ma => ma.toString())
      .find(addr => addr.includes('/ws/p2p/Qm'))

    if (!address) {
      throw new Error(`Could not find web socket address in ${id.addresses}`)
    }

    const peerA = path.join(os.tmpdir(), `test-${Date.now()}-a.txt`)
    const peerB = path.join(os.tmpdir(), `test-${Date.now()}-b.txt`)

    await Promise.all([
      testUI(server1.url, id.addresses[0], id.id, peerA, peerB),
      testUI(server2.url, id.addresses[0], id.id, peerB, peerA)
    ])
  } finally {
    await ipfsd.stop()
    await server1.stop()
    await server2.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  let local = null
  let remote = null

  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#peer')
    .clearValue('#peer')
    .setValue('#peer', process.env.IPFS_RELAY_ADDRESS)
    .pause(1000)
    .click('#connect')

  browser.expect.element('#peers-addrs').text.to.contain(process.env.IPFS_RELAY_ID)
  browser.expect.element('#peer-id').text.to.not.equal('')

  // exchange peer info
  browser.getText('#addrs', (result) => {
    local = {
      addr: result.value.trim()
    }
    console.info(`got local circuit relay address ${local.addr}`) // eslint-disable-line no-console
  })
    .getText('#peer-id', (result) => {
      local.id = result.value.trim()
      console.info(`got local peer id ${local.id}`) // eslint-disable-line no-console
    })
    .perform(async (browser, done) => {
      console.info(`writing local data ${local.addr}`) // eslint-disable-line no-console
      await fs.writeJson(process.env.IPFS_LOCAL_PEER_ID_FILE, local)

      console.info('reading remote circuit relay address') // eslint-disable-line no-console
      for (let i = 0; i < 100; i++) {
        try {
          remote = await fs.readJson(process.env.IPFS_REMOTE_PEER_ID_FILE, {
            encoding: 'utf8'
          })

          if (!remote || !remote.addr || !remote.id) {
            throw new Error('Remote circuit relay address was empty')
          }

          console.info(`got remote circuit relay address ${remote.addr}`) // eslint-disable-line no-console
          done()

          break
        } catch (err) {
          // ignore
        }

        await delay(1000)
      }

      console.info(`connecting to remote peer ${remote.addr}`) // eslint-disable-line no-console

      browser
        .clearValue('#peer')
        .setValue('#peer', remote.addr)
        .pause(1000)
        .click('#connect')

      browser.expect.element('#peers-addrs').text.to.contain(remote.id)

      browser
        .clearValue('#message')
        .setValue('#message', 'hello')
        .pause(1000)
        .click('#send')

      browser.expect.element('#msgs').text.to.contain(`${remote.id.substr(-4)}: hello`)
      browser.expect.element('#msgs').text.to.contain(`${local.id.substr(-4)}: hello`)
    })

  browser.end()
}
