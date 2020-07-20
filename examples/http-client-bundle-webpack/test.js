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

  browser
    .waitForElementVisible('#info-header')

  browser.expect.element('#info-header').text.to.contain('Everything is working!')
  browser.expect.element('#root').text.to.contain('Added a file!')
  browser.expect.element('#root').text.to.contain(process.env.IPFS_ID)
  browser.expect.element('#root').text.to.contain('hello world from webpacked IPFS')

  browser.end()
}
