'use strict'

const path = require('path')
const execa = require('execa')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsHttpModule: require('ipfs-http-client'),
  ipfsBin: require.resolve('ipfs/src/cli/bin.js')
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
    type: 'js',
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

  try {
    await testUI(app.url, daemon.apiAddr, daemon.api.peerId.id)
  } finally {
    await daemon.stop()
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

  // upload file
  browser
    .waitForElementVisible('#capture-media')
    .setValue('#input-file', require('path').resolve(__dirname + '/screenshot.png'))
    .pause(1000)

  browser.expect.element('#gateway-link').text.to.contain('QmWGmeq2kxsXqhrPhtTEhvck6PXucPf5153PSpZZRxvTwT')

  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#connect-input')
    .clearValue('#connect-input')
    .setValue('#connect-input', process.env.IPFS_API_MULTIADDR)
    .pause(1000)
    .click('#connect-submit')

  // upload file with file name
  browser
    .waitForElementVisible('#capture-media')
    .click('#keep-filename')
    .pause(1000)
    .setValue('#input-file', require('path').resolve(__dirname + '/screenshot.png'))
    .pause(1000)

  browser.expect.element('#gateway-link').text.to.contain('QmPJw5AYXfbqYXRX51zmdm7itSdt5tAWfGLSehwAhizLqp')

  browser.end()
}
