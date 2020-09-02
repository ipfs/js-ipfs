/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { expect } = require('aegir/utils/chai')
const ipldDagPb = require('ipld-dag-pb')
const { DAGNode } = ipldDagPb
const CID = require('cids')
const f = require('./utils/factory')()
const ipfsHttpClient = require('../src')

let ipfs

describe('.dag', function () {
  this.timeout(20 * 1000)
  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('should be able to put and get a DAG node with format dag-pb', async () => {
    const data = uint8ArrayFromString('some data')
    const node = new DAGNode(data)

    let cid = await ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' })
    cid = cid.toV0()
    expect(cid.codec).to.equal('dag-pb')
    cid = cid.toBaseEncodedString('base58btc')
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

  it('should be able to put and get a DAG node with format raw', async () => {
    const node = uint8ArrayFromString('some data')
    let cid = await ipfs.dag.put(node, { format: 'raw', hashAlg: 'sha2-256' })

    expect(cid.codec).to.equal('raw')
    cid = cid.toBaseEncodedString('base32')
    expect(cid).to.equal('bafkreiata6mq425fzikf5m26temcvg7mizjrxrkn35swuybmpah2ajan5y')

    const result = await ipfs.dag.get(cid)

    expect(result.value).to.deep.equal(node)
  })

  it('should error when missing DAG resolver for multicodec from requested CID', async () => {
    const block = await ipfs.block.put(Uint8Array.from([0, 1, 2, 3]), {
      cid: new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr')
    })

    await expect(ipfs.dag.get(block.cid)).to.eventually.be.rejectedWith('Missing IPLD format "git-raw"')
  })

  it('should error when putting node with esoteric format', () => {
    const node = uint8ArrayFromString('some data')

    return expect(ipfs.dag.put(node, { format: 'git-raw', hashAlg: 'sha2-256' })).to.eventually.be.rejectedWith(/Format unsupported/)
  })

  it('should attempt to load an unsupported format', async () => {
    let askedToLoadFormat
    const ipfs2 = ipfsHttpClient({
      url: `http://${ipfs.apiHost}:${ipfs.apiPort}`,
      ipld: {
        loadFormat: (format) => {
          askedToLoadFormat = format === 'git-raw'
          return {
            util: {
              serialize: (buf) => buf
            }
          }
        }
      }
    })

    const node = uint8ArrayFromString('some data')

    // error is from go-ipfs, this means the client serialized it ok
    await expect(ipfs2.dag.put(node, { format: 'git-raw', hashAlg: 'sha2-256' })).to.eventually.be.rejectedWith(/no parser for format "git-raw"/)

    expect(askedToLoadFormat).to.be.true()
  })

  it('should allow formats to be specified without overwriting others', async () => {
    const ipfs2 = ipfsHttpClient({
      url: `http://${ipfs.apiHost}:${ipfs.apiPort}`,
      ipld: {
        formats: [
          ipldDagPb
        ]
      }
    })

    const dagCborNode = {
      hello: 'world'
    }
    const cid1 = await ipfs2.dag.put(dagCborNode, {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
    })

    const dagPbNode = new DAGNode(new Uint8Array(0), [], 0)
    const cid2 = await ipfs2.dag.put(dagPbNode, {
      format: 'dag-pb',
      hashAlg: 'sha2-256'
    })

    await expect(ipfs2.dag.get(cid1)).to.eventually.have.property('value').that.deep.equals(dagCborNode)
    await expect(ipfs2.dag.get(cid2)).to.eventually.have.property('value').that.deep.equals(dagPbNode)
  })
})
