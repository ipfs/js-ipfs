'use strict'

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../src/core')
const fs = require('fs')

const introspection = async () => {
  let nodeDaemon
  let node
  let data = []

  // Start node
  await new Promise((resolve, reject) => {
    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: {}
    }, (err, _ipfsd) => {
      nodeDaemon = _ipfsd
      node = _ipfsd.api
      resolve()
    })
  })

  

  await new Promise((resolve, reject) => {
    const getSnapshot = () => {
      let snapshot = node.libp2p.introspection.host()

      const encodedData = node.libp2p.introspection.marshal(snapshot)
      const decodedData = node.libp2p.introspection.unmarshal(encodedData)

      data.push(decodedData)

      console.log('snapshot ', data.length)
      if (data.length === 60) {
        clearInterval(int)
        resolve()
      }
    }

    const int = setInterval(getSnapshot, 1000)
  })
  

  /*
  await new Promise(resolve => setTimeout(resolve, 10000))

  // Intropsection
  const data = node.libp2p.introspection.host() */

  // Stop node
  // await new Promise((resolve, reject) => {
  //   nodeDaemon.stop(() => resolve())
  // })

  // Write to a file
  const writeFile = (i) => {
    return new Promise ((resolve, reject) => {
      fs.writeFile(`${i}.json`, JSON.stringify(data[i], null, 4), 'utf8', () => resolve())
    })
  }

  // write files
  for (let i = 0; i < data.length; i++) {
    console.log('file', i)
    await writeFile(i)
  }

  console.log('all done')
  process.exit()
}

introspection()
