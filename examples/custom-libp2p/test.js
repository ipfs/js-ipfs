'use strict'

const path = require('path')
const execa = require('execa')
const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const SPDY = require('libp2p-spdy')
const MPLEX = require('pull-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const PeerBook = require('peer-book')

async function test () {
  let output = ''

  const proc = execa('node', [path.join(__dirname, 'index.js')], {
    cwd: path.resolve(__dirname),
    all: true
  })
  proc.all.on('data', async (data) => {
    process.stdout.write(data)

    output += data.toString('utf8')

    if (output.includes('The node now has')) {
      // the node has started up, try to dial it
      const address = output.trim().match(/Swarm listening on (.*)\n/)[1]

      console.info('Dialling', address)

      const peerInfo = new PeerInfo(await promisify(PeerId.create)())
      peerInfo.multiaddrs.add(multiaddr('/ip4/127.0.0.1/tcp/0'))

      const libp2p = new Libp2p({
        peerInfo,
        peerBook: new PeerBook(),
        modules: {
          transport: [
            TCP
          ],
          streamMuxer: [
            MPLEX,
            SPDY
          ],
          connEncryption: [
            SECIO
          ]
        }
      })
      await libp2p.start()
      await libp2p.dial(address)

      console.info('Dialled', address)

      proc.kill()

      await libp2p.stop()
    }
  })

  await proc.catch(() => {
    // throw new Error('libp2p should have been killed')
  }, (err) => {
    if (err.exitSignal !== 'SIGTERM') {
      throw err
    }
  })
}

module.exports = test
