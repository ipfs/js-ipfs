'use strict'

const IPFS = require('ipfs-core')

async function main () {
  // see https://github.com/ipld/interface-ipld-format for the interface definition
  const codec = {
    name: 'dag-test',
    codec: 392091,
    encode: (data) => uint8ArrayFromString(JSON.stringify(data)),
    decode: (buf) => JSON.parse(uint8ArrayToString(buf))
  }

  const node = await IPFS.create({
    ipld: {
      codecs: [
        codec
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
