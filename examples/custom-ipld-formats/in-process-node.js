// ordinarily we'd open a PR against the multicodec module to get our
// codec number added but since we're just testing we shim our new
// codec into the base-table.json file - this has to be done
// before requiring other modules as the int table will become read-only
const codecName = 'dag-test'
const codecNumber = 392091

const baseTable = require('multicodec/src/base-table.json')
baseTable[codecName] = codecNumber

// now require modules as usual
const IPFS = require('ipfs-core')
const multihashing = require('multihashing-async')
const multicodec = require('multicodec')
const CID = require('cids')

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
        return JSON.parse(buf.toString('utf8'))
      },
      async cid (buf) {
        const multihash = await multihashing(buf, format.defaultHashAlg)

        return new CID(1, format.codec, multihash)
      }
    }
  }

  const node = await IPFS.create({
    ipld: {
      formats: [
        format
      ]
    }
  })

  const data = {
    hello: 'world'
  }

  const cid = await node.dag.put(data, {
    format: codecName,
    hashAlg: format.defaultHashAlg
  })

  console.info(`Put ${JSON.stringify(data)} = CID(${cid})`)

  const {
    value
  } = await node.dag.get(cid)

  console.info(`Get CID(${cid}) = ${JSON.stringify(value)}`)

  await node.stop()
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
