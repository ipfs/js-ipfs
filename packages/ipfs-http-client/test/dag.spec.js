/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as raw from 'multiformats/codecs/raw'
import { base32 } from 'multiformats/bases/base32'
import { create as httpClient } from '../src/index.js'
import { factory } from './utils/factory.js'
const f = factory()

let ipfs

describe('.dag', function () {
  this.timeout(20 * 1000)
  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('should be able to put and get a DAG node with dag-pb codec', async () => {
    const data = uint8ArrayFromString('some data')
    const node = {
      Data: data,
      Links: []
    }

    const cid = await ipfs.dag.put(node, { storeCodec: 'dag-pb', hashAlg: 'sha2-256' })
    expect(cid.code).to.equal(dagPB.code)
    expect(cid.toV0().toString()).to.equal('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')

    const result = await ipfs.dag.get(cid)

    expect(result.value.Data).to.deep.equal(data)
  })

  it('should be able to put and get a DAG node with dag-cbor codec', async () => {
    const cbor = { foo: 'dag-cbor-bar' }
    const cid = await ipfs.dag.put(cbor, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })

    expect(cid.code).to.equal(dagCBOR.code)
    expect(cid.toString(base32)).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')

    const result = await ipfs.dag.get(cid)

    expect(result.value).to.deep.equal(cbor)
  })

  it('should be able to put and get a DAG node with raw codec', async () => {
    const node = uint8ArrayFromString('some data')
    const cid = await ipfs.dag.put(node, { storeCodec: 'raw', hashAlg: 'sha2-256' })

    expect(cid.code).to.equal(raw.code)
    expect(cid.toString(base32)).to.equal('bafkreiata6mq425fzikf5m26temcvg7mizjrxrkn35swuybmpah2ajan5y')

    const result = await ipfs.dag.get(cid)

    expect(result.value).to.deep.equal(node)
  })

  it('should error when missing DAG resolver for multicodec from requested CID', async () => {
    const cid = await ipfs.block.put(Uint8Array.from([0, 1, 2, 3]), {
      format: 'git-raw'
    })

    await expect(ipfs.dag.get(cid)).to.eventually.be.rejectedWith(/No codec found/)
  })

  it('should error when putting node with esoteric codec', () => {
    const node = uint8ArrayFromString('some data')

    return expect(ipfs.dag.put(node, { storeCodec: 'git-raw', hashAlg: 'sha2-256' })).to.eventually.be.rejectedWith(/No codec found/)
  })

  it('should pass through raw bytes with inputCodec', async () => {
    const node = uint8ArrayFromString('blob 9\0some data')
    // we don't support git-raw in the HTTP client, but inputCodec and a Uint8Array should make
    // the raw data pass through to go-ipfs, which does talk git-raw
    const cid = await ipfs.dag.put(node, { inputCodec: 'git-raw', storeCodec: 'git-raw', hashAlg: 'sha1' })
    expect(cid.code).to.equal(0x78)
    expect(cid.toString(base32)).to.equal('baf4bcfd4azdl7vj4d4hnix75qfld6mabo4l4uwa')
  })

  it('should attempt to load an unsupported codec', async () => {
    let askedToLoadCodec
    const ipfs2 = httpClient({
      url: `http://${ipfs.apiHost}:${ipfs.apiPort}`,
      ipld: {
        loadCodec: (codec) => {
          askedToLoadCodec = codec === 'boop'
          return {
            encode: (buf) => buf
          }
        }
      }
    })

    const node = uint8ArrayFromString('some data')

    // error is from go-ipfs, this means the client serialized it ok
    await expect(ipfs2.dag.put(node, { storeCodec: 'boop', hashAlg: 'sha2-256' })).to.eventually.be.rejectedWith(/unknown multicodec: "boop"/)

    expect(askedToLoadCodec).to.be.true()
  })

  it('should allow formats to be specified without overwriting others', async () => {
    const ipfs2 = httpClient({
      url: `http://${ipfs.apiHost}:${ipfs.apiPort}`,
      ipld: {
        codecs: [{
          name: 'custom-codec',
          code: 1337,
          encode: (thing) => thing,
          decode: (thing) => thing
        }]
      }
    })

    const dagCborNode = {
      hello: 'world'
    }
    const cid1 = await ipfs2.dag.put(dagCborNode, {
      storeCodec: 'dag-cbor',
      hashAlg: 'sha2-256'
    })

    const dagPbNode = {
      Data: new Uint8Array(0),
      Links: []
    }
    const cid2 = await ipfs2.dag.put(dagPbNode, {
      storeCodec: 'dag-pb',
      hashAlg: 'sha2-256'
    })

    await expect(ipfs2.dag.get(cid1)).to.eventually.have.property('value').that.deep.equals(dagCborNode)
    await expect(ipfs2.dag.get(cid2)).to.eventually.have.property('value').that.deep.equals(dagPbNode)
  })
})
