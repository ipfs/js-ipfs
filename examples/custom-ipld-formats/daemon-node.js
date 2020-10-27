// ordinarily we'd open a PR against the multicodec module to get our
// codec number added but since we're just testing we shim our new
// codec into the base-table.json file - this has to be done
// before requiring other modules as the int table will become read-only
const codecName = 'dag-test'
const codecNumber = 392091

const baseTable = require('multicodec/src/base-table.json')
baseTable[codecName] = codecNumber

// now require modules as usual
const IPFSDaemon = require('ipfs-cli/src/daemon')
const multihashing = require('multihashing-async')
const multihash = multihashing.multihash
const multicodec = require('multicodec')
const CID = require('cids')
const ipfsHttpClient = require('ipfs-http-client')
const uint8ArrayToString = require('uint8arrays/to-string')

async function main () {
  // see https://github.com/ipld/interface-ipld-format for the interface definition
  const format = {
    codec: codecNumber,
    defaultHashAlg: multicodec.SHA2_256,
    util: {
      serialize (data) {
        return Buffer.from(JSON.stringify(data))
      },
      deserialize (buf) {
        return JSON.parse(uint8ArrayToString(buf))
      },
      async cid (buf) {
        const multihash = await multihashing(buf, format.defaultHashAlg)

        return new CID(1, format.codec, multihash)
      }
    },
    resolver: {
      resolve: (buf, path) => {
        return {
          value: format.util.deserialize(buf),
          remainderPath: path
        }
      }
    }
  }

  // start an IPFS Daemon
  const daemon = new IPFSDaemon({
    ipld: {
      formats: [
        format
      ]
    }
  })
  await daemon.start()

  // in another process:
  const client = ipfsHttpClient({
    url: `http://localhost:${daemon._httpApi._apiServers[0].info.port}`,
    ipld: {
      formats: [
        format
      ]
    }
  })

  const data = {
    hello: 'world'
  }

  const cid = await client.dag.put(data, {
    format: codecName,
    hashAlg: multihash.codes[format.defaultHashAlg]
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
