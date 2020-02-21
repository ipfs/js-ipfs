'use strict'

const IpfsHttpClient = require('ipfs-http-client')
const { sleep, Logger, onEnterPress, catchAndLog } = require('./util')

async function main () {
  const apiUrlInput = document.getElementById('api-url')
  const nodeConnectBtn = document.getElementById('node-connect')

  const peerAddrInput = document.getElementById('peer-addr')
  const peerConnectBtn = document.getElementById('peer-connect')

  const topicInput = document.getElementById('topic')
  const subscribeBtn = document.getElementById('subscribe')

  const messageInput = document.getElementById('message')
  const sendBtn = document.getElementById('send')

  let log = Logger(document.getElementById('console'))
  let ipfs
  let topic
  let peerId

  async function reset () {
    if (ipfs && topic) {
      log(`Unsubscribing from topic ${topic}`)
      await ipfs.pubsub.unsubscribe(topic)
    }
    log = Logger(document.getElementById('console'))
    topicInput.value = ''
    topic = null
    peerId = null
    ipfs = null
  }

  async function nodeConnect (url) {
    await reset()
    log(`Connecting to ${url}`)
    ipfs = IpfsHttpClient(url)
    const { id, agentVersion } = await ipfs.id()
    peerId = id
    log(`<span class="green">Success!</span>`)
    log(`Version ${agentVersion}`)
    log(`Peer ID ${id}`)
  }

  async function peerConnect (addr) {
    if (!addr) throw new Error('Missing peer multiaddr')
    if (!ipfs) throw new Error('Connect to a node first')
    log(`Connecting to peer ${addr}`)
    await ipfs.swarm.connect(addr)
    log(`<span class="green">Success!</span>`)
    log('Listing swarm peers...')
    await sleep()
    const peers = await ipfs.swarm.peers()
    peers.forEach(peer => {
      const fullAddr = `${peer.addr}/ipfs/${peer.peer.toB58String()}`
      log(`<span class="${addr.endsWith(peer.peer.toB58String()) ? 'teal' : ''}">${fullAddr}</span>`)
    })
    log(`(${peers.length} peers total)`)
  }

  async function subscribe (nextTopic) {
    if (!nextTopic) throw new Error('Missing topic name')
    if (!ipfs) throw new Error('Connect to a node first')

    const lastTopic = topic

    if (topic) {
      topic = null
      log(`Unsubscribing from topic ${lastTopic}`)
      await ipfs.pubsub.unsubscribe(lastTopic)
    }

    log(`Subscribing to ${nextTopic}...`)

    await ipfs.pubsub.subscribe(nextTopic, msg => {
      const from = msg.from
      const seqno = msg.seqno.toString('hex')
      if (from === peerId) return log(`Ignoring message ${seqno} from self`)
      log(`Message ${seqno} from ${from}:`)
      try {
        log(JSON.stringify(msg.data.toString(), null, 2))
      } catch (_) {
        log(msg.data.toString('hex'))
      }
    }, {
      onError: (err, fatal) => {
        if (fatal) {
          console.error(err)
          log(`<span class="red">${err.message}</span>`)
          topic = null
          log('Resubscribing in 5s...')
          setTimeout(catchAndLog(() => subscribe(nextTopic), log), 5000)
        } else {
          console.warn(err)
        }
      }
    })

    topic = nextTopic
    log(`<span class="green">Success!</span>`)
  }

  async function send (msg) {
    if (!msg) throw new Error('Missing message')
    if (!topic) throw new Error('Subscribe to a topic first')
    if (!ipfs) throw new Error('Connect to a node first')

    log(`Sending message to ${topic}...`)
    await ipfs.pubsub.publish(topic, msg)
    log(`<span class="green">Success!</span>`)
  }

  const onNodeConnectClick = catchAndLog(() => nodeConnect(apiUrlInput.value), log)
  apiUrlInput.addEventListener('keydown', onEnterPress(onNodeConnectClick))
  nodeConnectBtn.addEventListener('click', onNodeConnectClick)

  const onPeerConnectClick = catchAndLog(() => peerConnect(peerAddrInput.value), log)
  peerAddrInput.addEventListener('keydown', onEnterPress(onPeerConnectClick))
  peerConnectBtn.addEventListener('click', onPeerConnectClick)

  const onSubscribeClick = catchAndLog(() => subscribe(topicInput.value), log)
  topicInput.addEventListener('keydown', onEnterPress(onSubscribeClick))
  subscribeBtn.addEventListener('click', onSubscribeClick)

  const onSendClick = catchAndLog(async () => {
    await send(messageInput.value)
    messageInput.value = ''
  }, log)
  messageInput.addEventListener('keydown', onEnterPress(onSendClick))
  sendBtn.addEventListener('click', onSendClick)
}

main()
