'use strict'

const path = require('path')
const execa = require('execa')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsClientModule: require('ipfs-client'),
  ipfsBin: require.resolve('ipfs/src/cli.js')
})
const {
  startServer
} = require('test-ipfs-example/utils')
const pkg = require('./package.json')

async function testUI (url, http, grpc, id) {
  const proc = execa(require.resolve('test-ipfs-example/node_modules/.bin/nightwatch'), ['--config', require.resolve('test-ipfs-example/nightwatch.conf.js'), path.join(__dirname, 'test.js')], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_GRPC_API_MULTIADDR: grpc,
      IPFS_HTTP_API_MULTIADDR: http
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
          API: '/ip4/127.0.0.1/tcp/0',
          RPC: '/ip4/127.0.0.1/tcp/0'
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
    await testUI(app.url, daemon.apiAddr, daemon.grpcAddr, daemon.api.peerId.id)
  } finally {
    await daemon.stop()
    await app.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#grpc-input')
    .clearValue('#grpc-input')
    .setValue('#grpc-input', process.env.IPFS_GRPC_API_MULTIADDR)
    .pause(1000)
    .waitForElementVisible('#http-input')
    .clearValue('#http-input')
    .setValue('#http-input', process.env.IPFS_HTTP_API_MULTIADDR)
    .pause(1000)
    .click('#connect-submit')

  browser.expect.element('#output').text.to.contain('Added file: file-0.txt QmUDLiEJwL3vUhhXNXDF2RrCnVkSB2LemWYffpCCPcQCeU')

  browser.end()
}
