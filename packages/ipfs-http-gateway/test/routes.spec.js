/* eslint-env mocha */
/* eslint dot-notation: 0, dot-notation: 0, quote-props: 0 */

import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import FileType from 'file-type'
import { CID } from 'multiformats/cid'
import { base32 } from 'multiformats/bases/base32'
import { http } from './utils/http.js'
import sinon from 'sinon'
import fs from 'fs'

describe('HTTP Gateway', function () {
  this.timeout(80 * 1000)

  let ipfs

  beforeEach(() => {
    ipfs = {
      name: {
        resolve: sinon.stub()
      },
      files: {
        stat: sinon.stub()
      },
      cat: sinon.stub(),
      dag: {
        get: sinon.stub()
      }
    }
  })

  it('returns 400 for request without argument', async () => {
    const res = await http({
      method: 'GET',
      url: '/ipfs'
    })

    expect(res).to.have.property('statusCode', 400)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(undefined)
  })

  it('returns 400 for request with invalid argument', async () => {
    const url = '/ipfs/invalid'
    ipfs.files.stat.withArgs(url).rejects(new Error('invalid character'))

    const res = await http({
      method: 'GET',
      url
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(undefined)
  })

  it('returns 400 for service worker registration outside of an IPFS content root', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file'
    })

    const res = await http({
      method: 'GET',
      url: `/ipfs/${cid}?filename=sw.js'`,
      headers: { 'Service-Worker': 'script' }
    }, { ipfs })

    // Expect 400 Bad Request
    // https://github.com/ipfs/go-ipfs/issues/4025#issuecomment-342250616
    expect(res).to.have.property('statusCode', 400)
  })

  it('valid CIDv0', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString('hello world\n')
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])
    const res = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.rawPayload).to.eql(uint8ArrayFromString('hello world' + '\n'))
    expect(res.payload).to.equal('hello world' + '\n')
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString()).to.equal('12')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers.etag).to.equal('"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o"')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeicg2rebjoofv4kbyovkw7af3rpiitvnl6i7ckcywaq6xjcxnc2mby')
  })

  it('returns CORS headers', async () => {
    const res = await http({
      method: 'OPTIONS',
      url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
      headers: {
        origin: 'http://example.com',
        'access-control-request-method': 'GET',
        'access-control-request-headers': ''
      }
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['access-control-allow-origin']).to.equal('http://example.com')
    expect(res.headers['access-control-allow-methods']).to.equal('GET')
  })

  /* TODO when support for CIDv1 lands
  it('valid CIDv1', (done) => {
    gateway.inject({
      method: 'GET',
      url: '/ipfs/TO-DO'
    }, (res) => {
      expect(res).to.have.property('statusCode', 200)
      expect(res.rawPayload).to.eql(uint8ArrayFromString('hello world' + '\n'))
      expect(res.payload).to.equal('hello world' + '\n')
      expect(res.headers.etag).to.equal(TO-DO)
      expect(res.headers['x-ipfs-path']).to.equal(TO-DO)
      expect(res.headers.suborigin).to.equal(TO-DO)
      expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')

      done()
    })
  })
  */

  it('return 304 Not Modified if client announces cached CID in If-None-Match', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString('hello world\n')
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])

    // Get file first to simulate caching it and reading Etag
    const resFirst = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['cache-control']).to.equal('public, max-age=29030400, immutable')

    // second request, this time announcing we have bigFileHash already in cache
    const resSecond = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: {
        'If-None-Match': resFirst.headers.etag
      }
    }, { ipfs })

    // expect HTTP 304 Not Modified without payload
    expect(resSecond.statusCode).to.equal(304)
    expect(resSecond.rawPayload).to.be.empty()

    // should only have fetched content once
    expect(ipfs.cat.callCount).to.equal(1)
  })

  it('return 304 Not Modified if /ipfs/ was requested with any If-Modified-Since', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString('hello world\n')
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])

    // Get file first to simulate caching it and reading Etag
    const resFirst = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['cache-control']).to.equal('public, max-age=29030400, immutable')

    // second request, this time with If-Modified-Since equal present
    const resSecond = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: {
        'If-Modified-Since': new Date().toUTCString()
      }
    }, { ipfs })

    // expect HTTP 304 Not Modified without payload
    expect(resSecond.statusCode).to.equal(304)
    expect(resSecond.rawPayload).to.be.empty()

    // should only have fetched content once
    expect(ipfs.cat.callCount).to.equal(1)
  })

  it('return proper Content-Disposition if ?filename=foo is included in URL', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString('hello world\n')
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])

    // Get file first to simulate caching it and reading Etag
    const resFirst = await http({
      method: 'GET',
      url: `/ipfs/${cid}?filename=pretty-name-in-utf8-%C3%B3%C3%B0%C5%9B%C3%B3%C3%B0%C5%82%C4%85%C5%9B%C5%81.txt`
    }, { ipfs })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['content-disposition']).to.equal('inline; filename*=UTF-8\'\'pretty-name-in-utf8-%C3%B3%C3%B0%C5%9B%C3%B3%C3%B0%C5%82%C4%85%C5%9B%C5%81.txt')
  })

  it('load a big file (15MB)', async () => {
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString(new Array(15000000).fill('0').join(''))
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.rawPayload).to.eql(content)
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString()).to.equal('15000000')
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${cid}`)
    expect(res.headers['etag']).to.equal(`"${cid}"`)
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['content-type']).to.equal('application/octet-stream')
  })

  it('load specific byte range of a file (from-)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileLength = 12
    const range = { from: 1, length: 11 }
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString(new Array(fileLength).fill('0').join(''))
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])
    ipfs.cat.withArgs(cid, {
      offset: range.from,
      length: range.length
    }).returns([
      content.slice(1, 12)
    ])

    // get full file first to read accept-ranges and etag headers
    const resFull = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${cid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length.toString()).to.equal(fileLength.toString())

    // extract expected chunk of interest
    const rangeValue = `bytes=${range.from}-`
    const expectedChunk = resFull.rawPayload.slice(range.from)

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    }, { ipfs })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.length}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length.toString()).to.equal(range.length.toString())
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${cid}`)
    expect(resRange.headers['etag']).to.equal(`"${cid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  it('load specific byte range of a file (from-to)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileLength = 12
    const range = { from: 1, to: 3, length: 3 }
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString(new Array(fileLength).fill('0').join(''))
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])
    ipfs.cat.withArgs(cid, {
      offset: range.from,
      length: range.length
    }).returns([
      content.slice(1, 4)
    ])

    // get full file first to read accept-ranges and etag headers
    const resFull = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${cid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length.toString()).to.equal(fileLength.toString())

    // extract expected chunk of interest
    const rangeValue = `bytes=${range.from}-${range.to}`
    const expectedChunk = resFull.rawPayload.slice(range.from, range.to + 1) // include end

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    }, { ipfs })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.to}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length.toString()).to.equal(range.length.toString())
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${cid}`)
    expect(resRange.headers['etag']).to.equal(`"${cid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  // This one is tricky, as "-to" does not mean implicit "0-to",
  // but "give me last N bytes"
  // More at https://tools.ietf.org/html/rfc7233#section-2.1
  it('load specific byte range of a file (-tail AKA bytes from end)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileLength = 12
    const range = { tail: 7, from: 5, to: 11, length: 7 }
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString(new Array(fileLength).fill('0').join(''))
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(cid).returns([
      content
    ])
    ipfs.cat.withArgs(cid, {
      offset: range.from,
      length: range.length
    }).returns([
      content.slice(1, 8)
    ])

    // get full file first to read accept-ranges and etag headers
    const resFull = await http({
      method: 'GET',
      url: `/ipfs/${cid}`
    }, { ipfs })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${cid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length.toString()).to.equal(fileLength.toString())

    // extract expected chunk of interest
    const rangeValue = `bytes=-${range.tail}`
    const expectedChunk = resFull.rawPayload.slice(range.from, range.to + 1) // include end

    // const expectedChunkBytes = resFull.rawPayload.slice(range.from, range.to)
    const resRange = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    }, { ipfs })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.to}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length.toString()).to.equal(range.length.toString())
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${cid}`)
    expect(resRange.headers['etag']).to.equal(`"${cid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  it('return 416 (Range Not Satisfiable) on invalid range request', async () => {
    // requesting range outside of file length
    const rangeValue = 'bytes=42-100'

    // use 12 byte text file to make it easier to debug ;-)
    const fileLength = 12
    const cid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = uint8ArrayFromString(new Array(fileLength).fill('0').join(''))
    ipfs.files.stat.withArgs(`/ipfs/${cid}`).resolves({
      cid,
      type: 'file',
      size: content.length
    })

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await http({
      method: 'GET',
      url: `/ipfs/${cid}`,
      headers: { 'range': rangeValue }
    }, { ipfs })

    // Expect 416 Range Not Satisfiable
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416
    expect(resRange.statusCode).to.equal(416)
    expect(resRange.headers['content-range']).to.equal('bytes */12')
    expect(resRange.headers['cache-control']).to.equal('no-cache')
  })

  it('load a jpg file', async () => {
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = fs.readFileSync('test/fixtures/cat-folder/cat.jpg')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/cat.jpg`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/cat.jpg`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString()).to.equal(content.length.toString())
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${dirCid}/cat.jpg`)
    expect(res.headers['etag']).to.equal(`"${fileCid}"`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)

    const fileSignature = await FileType.fromBuffer(res.rawPayload)
    expect(fileSignature.mime).to.equal('image/jpeg')
    expect(fileSignature.ext).to.equal('jpg')
  })

  it('load a svg file (unsniffable)', async () => {
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = fs.readFileSync('test/fixtures/unsniffable-folder/hexagons.svg')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/hexagons.svg`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/hexagons.svg`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a svg file with xml leading declaration (unsniffable)', async () => {
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const content = fs.readFileSync('test/fixtures/unsniffable-folder/hexagons-xml.svg')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/hexagons-xml.svg`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/hexagons-xml.svg`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a directory', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/`).resolves({
      cid: dirCid,
      type: 'directory'
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}//index.html`).rejects(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}//index.htm`).rejects(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}//index.shtml`).rejects(new Error('does not exist'))
    ipfs.dag.get.withArgs(dirCid).returns({
      value: {
        Links: [{
          Name: 'cat.jpg',
          Tsize: 12
        }]
      }
    })

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${dirCid}/`)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)

    // check if the cat picture is in the payload as a way to check
    // if this is an index of this directory
    const listedFile = res.payload.match(/\/ipfs\/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o\/cat\.jpg/g)
    expect(listedFile).to.have.lengthOf(1)
  })

  it('load a webpage index.html', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const content = fs.readFileSync('test/fixtures/index.html')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.html`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/index.html`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${dirCid}/index.html`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString())
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)
    expect(res.rawPayload).to.deep.equal(content)
  })

  it('load a webpage {hash}/nested-folder/nested.html', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const content = fs.readFileSync('test/fixtures/index.html')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/nested-folder/nested.html`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/nested-folder/nested.html`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${dirCid}/nested-folder/nested.html`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString())
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)
    expect(res.rawPayload).to.deep.equal(content)
  })

  it('redirects to generated index', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}`).resolves({
      cid: dirCid,
      type: 'directory'
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.html`).throws(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.htm`).throws(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.shtml`).throws(new Error('does not exist'))
    ipfs.dag.get.withArgs(dirCid).returns({
      value: {
        Links: []
      }
    })

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}`
    }, { ipfs })

    expect(res.statusCode).to.equal(301)
    expect(res.headers.location).to.equal(`/ipfs/${dirCid}/`)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
  })

  it('redirect to a directory with index.html', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}`).resolves({
      cid: dirCid,
      type: 'directory'
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.html`).resolves({
      cid: fileCid,
      type: 'file'
    })

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}` // note lack of '/' at the end
    }, { ipfs })

    // we expect redirect to the same path but with '/' at the end
    expect(res.statusCode).to.equal(301)
    expect(res.headers.location).to.equal(`/ipfs/${dirCid}/`)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
  })

  it('load a directory with index.html', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const content = fs.readFileSync('test/fixtures/index.html')
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/`).resolves({
      cid: dirCid,
      type: 'directory'
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}//index.html`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.html`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: `/ipfs/${dirCid}/` // note '/' at the end
    }, { ipfs })

    // confirm payload is index.html
    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${dirCid}/`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString())
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)
    expect(res.rawPayload).to.deep.equal(content)
  })

  it('test(gateway): load from URI-encoded path', async () => {
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    // non-ascii characters will be URI-encoded by the browser
    const utf8path = `/ipfs/${dirCid}/cat-with-óąśśł-and-أعظم._.jpg`
    const escapedPath = encodeURI(utf8path) // this is what will be actually requested
    const content = fs.readFileSync('test/fixtures/index.html')
    ipfs.files.stat.withArgs(utf8path).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: escapedPath
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['x-ipfs-path']).to.equal(escapedPath)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString())
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipfs000${dirCid.toV1().toString(base32)}`)
  })

  it('load a file from IPNS', async () => {
    const id = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7A'
    const ipnsPath = `/ipns/${id}/cat.jpg`
    const fileCid = CID.parse('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const content = fs.readFileSync('test/fixtures/cat-folder/cat.jpg')

    ipfs.name.resolve.withArgs(ipnsPath).returns([`/ipfs/${fileCid}`])
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.files.stat.withArgs(`/ipfs/${fileCid}`).resolves({
      cid: fileCid,
      type: 'file',
      size: content.length
    })
    ipfs.cat.withArgs(fileCid).returns([
      content
    ])

    const res = await http({
      method: 'GET',
      url: ipnsPath
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length.toString()).to.equal('443230')
    expect(res.headers['x-ipfs-path']).to.equal(ipnsPath)
    expect(res.headers['etag']).to.equal(`"${fileCid}"`)
    expect(res.headers['cache-control']).to.equal('no-cache') // TODO: should be record TTL
    expect(res.headers['last-modified']).to.equal(undefined)
    expect(res.headers.etag).to.equal(`"${fileCid}"`)
    expect(res.headers.suborigin).to.equal(`ipns000${CID.parse(id).toV1().toString()}`)

    const fileSignature = await FileType.fromBuffer(res.rawPayload)
    expect(fileSignature.mime).to.equal('image/jpeg')
    expect(fileSignature.ext).to.equal('jpg')
  }, { ipfs })

  it('load a directory from IPNS', async () => {
    const id = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7A'
    const ipnsPath = `/ipns/${id}/`
    const dirCid = CID.parse('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    ipfs.name.resolve.withArgs(ipnsPath).returns([`/ipfs/${dirCid}`])
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}`).resolves({
      cid: dirCid,
      type: 'directory'
    })
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.html`).rejects(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.htm`).rejects(new Error('does not exist'))
    ipfs.files.stat.withArgs(`/ipfs/${dirCid}/index.shtml`).rejects(new Error('does not exist'))
    ipfs.dag.get.withArgs(dirCid).returns({
      value: {
        Links: [{
          Name: 'cat.jpg',
          Tsize: 12
        }]
      }
    })

    const res = await http({
      method: 'GET',
      url: ipnsPath
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(ipnsPath)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers['last-modified']).to.equal(undefined)
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(`ipns000${CID.parse(id).toV1().toString()}`)

    // check if the cat picture is in the payload as a way to check
    // if this is an index of this directory
    const listedFile = res.payload.match(/\/cat\.jpg/g)
    expect(listedFile).to.have.lengthOf(1)
  })
})
