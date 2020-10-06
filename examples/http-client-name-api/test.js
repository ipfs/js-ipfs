'use strict'

const path = require('path')
const execa = require('execa')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsHttpModule: require('ipfs-http-client'),
  ipfsBin: require('go-ipfs').path(),
  args: ['--enable-pubsub-experiment']
})
const {
  startServer
} = require('test-ipfs-example/utils')
const pkg = require('./package.json')

async function testUI (url, api, id) {
  const proc = execa(require.resolve('test-ipfs-example/node_modules/.bin/nightwatch'), ['--config', require.resolve('test-ipfs-example/nightwatch.conf.js'), path.join(__dirname, 'test.js')], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_API_MULTIADDR: api,
      IPFS_ID: id
    },
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runTest () {
  const app = await startServer(__dirname)
  const daemon = await df.spawn({
    type: 'go',
    test: true,
    ipfsOptions: {
      config: {
        Addresses: {
          API: '/ip4/127.0.0.1/tcp/0'
        },
        API: {
          HTTPHeaders: {
            'Access-Control-Allow-Origin': [
              app.url
            ]
          }
        }
      }
    }
  })

  // Cannot publish ipns names without peers
  const daemon2 = await df.spawn({
    type: 'go',
    test: true
  })
  await daemon.api.swarm.connect(await daemon2.api.peerId.addresses[0])

  try {
    await testUI(app.url, daemon.apiAddr, daemon.api.peerId.id)
  } finally {
    await daemon.stop()
    await daemon2.stop()
    await app.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#connect-input')
    .clearValue('#connect-input')
    .setValue('#connect-input', process.env.IPFS_API_MULTIADDR)
    .pause(1000)
    .click('#connect-submit')

  browser.expect.element('#status').text.to.contain(`Daemon active\nID: ${process.env.IPFS_ID}`)

  const content = 'hello world'

  // publish a name
  browser
    .waitForElementVisible('#add-file-input')
    .clearValue('#add-file-input')
    .setValue('#add-file-input', content)
    .pause(1000)
    .click('#add-file-submit')

  browser.expect.element('#publish-result').text.to.contain('/ipns/k')

  // resolve a name
  browser.getText('#publish-result', (result) => {
    const ipnsName = result.value.trim()

    browser
      .waitForElementVisible('#resolve-name-input')
      .clearValue('#resolve-name-input')
      .setValue('#resolve-name-input', ipnsName)
      .pause(1000)
      .click('#resolve-name-submit')

    browser.expect.element('#resolve-result').text.to.contain('/ipfs/Qm')
  })

  browser.end()
}
