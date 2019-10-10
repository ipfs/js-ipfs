'use strict'

const path = require('path')
const execa = require('execa')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'js',
  exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
  IpfsClient: require('ipfs-http-client')
})
const {
  startServer
} = require('../utils')
const pkg = require('./package.json')

async function testUI (url, relay, cid, workspaceName, addFile) {
  const proc = execa('nightwatch', [ path.join(__dirname, 'test.js') ], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_RELAY_ADDRESS: relay,
      IPFS_CID: cid,
      IPFS_WORKSPACE_NAME: workspaceName,
      IPFS_ADD_FILE: addFile
    }
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runTest () {
  const ipfsd = await df.spawn({
    initOptions: { bits: 512 },
    config: {
      Addresses: {
        Swarm: [
          `/ip4/127.0.0.1/tcp/0/ws`
        ]
      },
      Bootstrap: []
    }
  })

  const [{
    hash: cid
  }] = await ipfsd.api.add('A file with some content')
  const server1 = await startServer(__dirname)
  const server2 = await startServer(__dirname)

  try {
    const id = await ipfsd.api.id()
    const address = id.addresses.filter(addr => addr.includes('/ws/ipfs/Qm')).pop()

    if (!address) {
      throw new Error(`Could not find web socket address in ${id.addresses}`)
    }

    let workspaceName = `test-${Date.now()}`

    await Promise.all([
      testUI(server1.url, id.addresses[0], cid, workspaceName, true),
      testUI(server2.url, id.addresses[0], cid, workspaceName)
    ])
  } finally {
    await ipfsd.stop()
    await server1.stop()
    await server2.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('.node-addresses li pre')
    .pause(1000)
    .clearValue('#multiaddr-input')
    .setValue('#multiaddr-input', process.env.IPFS_RELAY_ADDRESS)
    .pause(1000)
    .click('#peer-btn')

  browser.expect.element('#peers').text.to.contain(process.env.IPFS_RELAY_ADDRESS).before(30000)

  browser
    .clearValue('#workspace-input')
    .setValue('#workspace-input', process.env.IPFS_WORKSPACE_NAME)
    .pause(1000)
    .click('#workspace-btn')

  browser.expect.element('#logs').text.to.contain(`Subscribed to workspace #${process.env.IPFS_WORKSPACE_NAME}`).before(30000)

  // only one browser should add the file to the workspace
  if (process.env.IPFS_ADD_FILE) {
    // add the file from the server
    browser
      .clearValue('#cid-input')
      .setValue('#cid-input', process.env.IPFS_CID)
      .pause(1000)
      .click('#fetch-btn')

    browser.expect.element('#logs').text.to.contain(`The ${process.env.IPFS_CID} file was added.`).before(30000)
  }

  // but should both see the added file
  browser.expect.element('#file-history').text.to.contain(process.env.IPFS_CID).before(30000)

  browser.end()
}
