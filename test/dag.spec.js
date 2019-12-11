/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { DAGNode } = require('ipld-dag-pb')
const CID = require('cids')
const f = require('./utils/factory')

let ipfs

describe('.dag', function () {
  this.timeout(20 * 1000)
  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('should be able to put and get a DAG node with format dag-pb', async () => {
    const data = Buffer.from('some data')
    const node = new DAGNode(data)

    let cid = await ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' })
    cid = cid.toV0()
    expect(cid.codec).to.equal('dag-pb')
    cid = cid.toBaseEncodedString('base58btc')
    // expect(cid).to.equal('bafybeig3t3eugdchignsgkou3ly2mmy4ic4gtfor7inftnqn3yq4ws3a5u')
    expect(cid).to.equal('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')

    const result = await ipfs.dag.get(cid)

    expect(result.value.Data).to.deep.equal(data)
  })

  it('should be able to put and get a DAG node with format dag-cbor', async () => {
    const cbor = { foo: 'dag-cbor-bar' }
    let cid = await ipfs.dag.put(cbor, { format: 'dag-cbor', hashAlg: 'sha2-256' })

    expect(cid.codec).to.equal('dag-cbor')
    cid = cid.toBaseEncodedString('base32')
    expect(cid).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')

    const result = await ipfs.dag.get(cid)

    expect(result.value).to.deep.equal(cbor)
  })

  it('should callback with error when missing DAG resolver for multicodec from requested CID', async () => {
    const block = await ipfs.block.put(Buffer.from([0, 1, 2, 3]), {
      cid: new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr')
    })

    await expect(ipfs.dag.get(block.cid)).to.be.rejectedWith('Missing IPLD format "git-raw"')
  })
})
