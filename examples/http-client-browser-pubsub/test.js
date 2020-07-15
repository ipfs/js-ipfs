'use strict'

const path = require('path')
const execa = require('execa')
const { createFactory } = require('ipfsd-ctl')
const df = createFactory({
  ipfsHttpModule: require('ipfs-http-client'),
}, {
  js: {
    ipfsBin: require.resolve('ipfs/src/cli/bin.js')
  },
  go: {
    ipfsBin: require('go-ipfs').path(),
    args: ['--enable-pubsub-experiment']
  }
})
const {
  startServer
} = require('test-ipfs-example/utils')
const pkg = require('./package.json')

async function testUI (url, id, apiAddr, peerAddr, topic) {
  const proc = execa(require.resolve('test-ipfs-example/node_modules/.bin/nightwatch'), ['--config', require.resolve('test-ipfs-example/nightwatch.conf.js'), path.join(__dirname, 'test.js')], {
    cwd: path.resolve(__dirname, '../'),
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: url,
      IPFS_API_ADDRESS: apiAddr,
      IPFS_ID: id,
      IPFS_PEER_ADDRESS: peerAddr,
      IPFS_TOPIC: topic
    },
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runTest () {
  const app1 = await startServer(__dirname)
  const app2 = await startServer(__dirname)
  const js = await df.spawn({
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
              app1.url
            ]
          }
        }
      }
    }
  })
  const go = await df.spawn({
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
              app2.url
            ]
          }
        }
      }
    }
  })

  const topic = `topic-${Math.random()}`

  try {
    await Promise.all([
      testUI(app1.url, js.api.peerId.id, js.apiAddr, go.api.peerId.addresses[0].toString(), topic),
      testUI(app2.url, go.api.peerId.id, go.apiAddr, js.api.peerId.addresses[0].toString(), topic)
    ])
  } finally {
    await js.stop()
    await go.stop()
    await app1.stop()
    await app2.stop()
  }
}

module.exports = runTest

module.exports[pkg.name] = function (browser) {
  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible('#api-url')
    .clearValue('#api-url')
    .setValue('#api-url', process.env.IPFS_API_ADDRESS)
    .pause(1000)
    .click('#node-connect')

  browser.expect.element('#console').text.to.contain(`Connecting to ${process.env.IPFS_API_ADDRESS}\nSuccess!`)

  // connect to peer
  browser
    .waitForElementVisible('#peer-addr')
    .clearValue('#peer-addr')
    .setValue('#peer-addr', process.env.IPFS_PEER_ADDRESS)
    .pause(1000)
    .click('#peer-connect')

  browser.expect.element('#console').text.to.contain(`Connecting to peer ${process.env.IPFS_PEER_ADDRESS}\nSuccess!`)

  // subscribe to topic
  browser
    .waitForElementVisible('#topic')
    .clearValue('#topic')
    .setValue('#topic', process.env.IPFS_TOPIC)
    .pause(1000)
    .click('#subscribe')

  browser.expect.element('#console').text.to.contain(`Subscribing to ${process.env.IPFS_TOPIC}...\nSuccess!`)

  // send a message
  browser
    .waitForElementVisible('#message')
    .clearValue('#message')
    .setValue('#message', 'hello')
    .pause(1000)
    .click('#send')

  const remotePeerId = process.env.IPFS_PEER_ADDRESS.split('/').pop()

  browser.expect.element('#console').text.to.contain(`from ${remotePeerId}:\n"hello"`)

  browser.end()
}
