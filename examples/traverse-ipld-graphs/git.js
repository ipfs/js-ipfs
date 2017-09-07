'use strict'

const createNode = require('./create-node.js')
const asyncEach = require('async/each')
const path = require('path')
const multihashing = require('multihashing-async')
const Block = require('ipfs-block')
const CID = require('cids')
const fs = require('fs')

createNode((err, ipfs) => {
  if (err) {
    throw err
  }

  console.log('\nStart of the example:')

  const gitObjects = [
    path.join(__dirname, '/git-objects/0f328c91df28c5c01b9e9f9f7e663191fa156593'),
    path.join(__dirname, '/git-objects/177bf18bc707d82b21cdefd0b43b38fc8c5c13fe'),
    path.join(__dirname, '/git-objects/23cc25f631cb076d5de5036c87678ea713cbaa6a'),
    path.join(__dirname, '/git-objects/4e425dba7745a781f0712c9a01455899e8c0c249'),
    path.join(__dirname, '/git-objects/6850c7be7136e6be00976ddbae80671b945c3e9d'),
    path.join(__dirname, '/git-objects/a5095353cd62a178663dd26efc2d61f4f61bccbe'),
    path.join(__dirname, '/git-objects/dc9bd15e8b81b6565d3736f9c308bd1bba60f33a'),
    path.join(__dirname, '/git-objects/e68e6f6e31857877a79fd6b3956898436bb5a76f'),
    path.join(__dirname, '/git-objects/ee62b3d206cb23f939208898f32d8708c0e3fa3c'),
    path.join(__dirname, '/git-objects/ee71cef5001b84b0314438f76cf0acd338a2fd21')
  ]

  asyncEach(gitObjects, (gitObjectsPath, cb) => {
    const data = fs.readFileSync(gitObjectsPath)

    multihashing(data, 'sha1', (err, multihash) => {
      if (err) {
        return cb(err)
      }
      const cid = new CID(1, 'git-raw', multihash)
      console.log(cid.toBaseEncodedString())

      ipfs.block.put(new Block(data, cid), cb)
    })
  }, (err) => {
    if (err) {
      throw err
    }

    const v1tag = 'z8mWaGfwSWLMPJ6Q2JdsAjGiXTf61Nbue'

    function errOrLog (comment) {
      return (err, result) => {
        if (err) {
          throw err
        }

        if (Buffer.isBuffer(result.value)) { // Blobs (files) are returned as buffer instance
          result.value = result.value.toString()
        }

        console.log('-'.repeat(80))
        console.log(comment)
        console.log(result.value)
      }
    }

    ipfs.dag.get(v1tag + '/', errOrLog('Tag object:'))
    ipfs.dag.get(v1tag + '/object/message', errOrLog('Tagged commit message:'))
    ipfs.dag.get(v1tag + '/object/parents/0/message', errOrLog('Parent of tagged commit:'))

    ipfs.dag.get(v1tag + '/object/tree/src/hash/hello/hash', errOrLog('/src/hello file:'))
    ipfs.dag.get(v1tag + '/object/parents/0/tree/src/hash/hello/hash', errOrLog('previous version of /src/hello file:'))
  })
})
