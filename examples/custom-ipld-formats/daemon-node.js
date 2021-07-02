// ordinarily we'd open a PR against the multicodec module to get our
// codec number added but since we're just testing we shim our new
// codec into the base-table.json file - this has to be done
// before requiring other modules as the int table will become read-only

// now require modules as usual
const IPFSDaemon = require('ipfs-daemon')
const ipfsHttpClient = require('ipfs-http-client')
const uint8ArrayToString = require('uint8arrays/to-string')

async function main () {
  // see https://github.com/multiformats/js-multiformats#multicodec-encoders--decoders--codecs for the interface definition
  const codec = {
    name: 'dag-test',
    codec: 392091,
    encode: (data) => uint8ArrayFromString(JSON.stringify(data)),
    decode: (buf) => JSON.parse(uint8ArrayToString(buf))
  }

  // start an IPFS Daemon
  const daemon = new IPFSDaemon({
    ipld: {
      codecs: [
        codec
      ]
    }
  })
  await daemon.start()

  // in another process:
  const client = ipfsHttpClient.create({
    url: `http://localhost:${daemon._httpApi._apiServers[0].info.port}`,
    ipld: {
      codecs: [
        codec
      ]
    }
  })

  const data = {
    hello: 'world'
  }

  const cid = await client.dag.put(data, {
    format: 'dag-test',
    hashAlg: 'sha2-256'
  })

  console.info(`Put ${JSON.stringify(data)} = CID(${cid})`)

  const {
    value
  } = await client.dag.get(cid)

  console.info(`Get CID(${cid}) = ${JSON.stringify(value)}`)

  await daemon.stop()
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    // https://github.com/libp2p/js-libp2p/issues/779
    process.exit(0)
  })
