'use strict'

const fs = require('fs-extra')
const path = require('path')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'proc',
  exec: require('../../')
})

async function runTest () {
  const ipfsd = await df.spawn({
    initOptions: { bits: 512 },
    config: {
      Addresses: {
        Swarm: []
      },
      Bootstrap: []
    },
    disposable: true
  })

  const cids = []

  console.info('Importing eth-blocks')
  for (const file of await fs.readdir(path.join(__dirname, 'eth-stuffs'))) {
    const ethBlock = await fs.readFile(path.join(__dirname, 'eth-stuffs', file))
    const block = await ipfsd.api.block.put(ethBlock, {
      format: 'eth-block',
      mhtype: 'keccak-256'
    })

    cids.push(block.cid)
  }

  console.info('Reading eth-blocks back out')
  for (const cid of cids) {
    try {
      await ipfsd.api.dag.get(cid)
      console.error('block was ok', cid.toString())
    } catch (err) {
      console.error('block was invalid', cid.toString())
      console.error(err)
    }
  }

  await ipfsd.stop()
}

module.exports = runTest
