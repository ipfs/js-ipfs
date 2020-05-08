/* eslint-env mocha */
/* eslint dot-notation: 0, dot-notation: 0, quote-props: 0 */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { Buffer } = require('buffer')
const Daemon = require('../../src/cli/daemon')
const loadFixture = require('aegir/fixtures')
const os = require('os')
const path = require('path')
const { nanoid } = require('nanoid')
const FileType = require('file-type')
const CID = require('cids')
const all = require('it-all')

const bigFile = loadFixture('test/fixtures/15mb.random', 'interface-ipfs-core')
const directoryContent = {
  'index.html': loadFixture('test/gateway/test-folder/index.html'),
  'nested-folder/hello.txt': loadFixture('test/gateway/test-folder/nested-folder/hello.txt'),
  'nested-folder/ipfs.txt': loadFixture('test/gateway/test-folder/nested-folder/ipfs.txt'),
  'nested-folder/nested.html': loadFixture('test/gateway/test-folder/nested-folder/nested.html'),
  'cat-folder/cat.jpg': loadFixture('test/gateway/test-folder/cat-folder/cat.jpg'),
  'utf8/cat-with-óąśśł-and-أعظم._.jpg': loadFixture('test/gateway/test-folder/cat-folder/cat.jpg'),
  'unsniffable-folder/hexagons-xml.svg': loadFixture('test/gateway/test-folder/unsniffable-folder/hexagons-xml.svg'),
  'unsniffable-folder/hexagons.svg': loadFixture('test/gateway/test-folder/unsniffable-folder/hexagons.svg')
}

describe('HTTP Gateway', function () {
  this.timeout(80 * 1000)

  const http = {}
  let gateway

  before(async () => {
    this.timeout(60 * 1000)
    const repoPath = path.join(os.tmpdir(), '/ipfs-' + nanoid())

    http.api = new Daemon({
      repo: repoPath,
      init: true,
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/0'],
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/127.0.0.1/tcp/0'
        },
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      },
      preload: { enabled: false }
    })

    const content = (name) => ({
      path: `test-folder/${name}`,
      content: directoryContent[name]
    })

    const emptyDir = (name) => ({ path: `test-folder/${name}` })

    await http.api.start()

    gateway = http.api._httpApi._gatewayServers[0]

    // QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi
    await all(http.api._ipfs.add([
      content('index.html'),
      emptyDir('empty-folder'),
      content('nested-folder/hello.txt'),
      content('nested-folder/ipfs.txt'),
      content('nested-folder/nested.html'),
      emptyDir('nested-folder/empty')
    ]))
    // Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq
    await all(http.api._ipfs.add(bigFile))
    // QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o
    await all(http.api._ipfs.add(Buffer.from('hello world' + '\n'), { cidVersion: 0 }))
    // QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ
    await all(http.api._ipfs.add([content('cat-folder/cat.jpg')]))
    // QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F
    await all(http.api._ipfs.add([
      content('unsniffable-folder/hexagons-xml.svg'),
      content('unsniffable-folder/hexagons.svg')
    ]))
    // QmaRdtkDark8TgXPdDczwBneadyF44JvFGbrKLTkmTUhHk
    await all(http.api._ipfs.add([content('utf8/cat-with-óąśśł-and-أعظم._.jpg')]))
    // Publish QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ to IPNS using self key
    await http.api._ipfs.name.publish('QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ', { resolve: false })
  })

  after(() => http.api.stop())

  it('returns 400 for request without argument', async () => {
    const res = await gateway.inject({
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
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/invalid'
    })

    expect(res).to.have.property('statusCode', 400)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(undefined)
  })

  it('returns 400 for service worker registration outside of an IPFS content root', async () => {
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o?filename=sw.js',
      headers: { 'Service-Worker': 'script' }
    })

    // Expect 400 Bad Request
    // https://github.com/ipfs/go-ipfs/issues/4025#issuecomment-342250616
    expect(res).to.have.property('statusCode', 400)
  })

  it('valid CIDv0', async () => {
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.rawPayload).to.eql(Buffer.from('hello world' + '\n'))
    expect(res.payload).to.equal('hello world' + '\n')
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length).to.equal(12)
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers.etag).to.equal('"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o"')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeicg2rebjoofv4kbyovkw7af3rpiitvnl6i7ckcywaq6xjcxnc2mby')
  })

  it('returns CORS headers', async () => {
    const res = await gateway.inject({
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
      expect(res.rawPayload).to.eql(Buffer.from('hello world' + '\n'))
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
    const cid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

    // Get file first to simulate caching it and reading Etag
    const resFirst = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + cid
    })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['cache-control']).to.equal('public, max-age=29030400, immutable')

    // second request, this time announcing we have bigFileHash already in cache
    const resSecond = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + cid,
      headers: {
        'If-None-Match': resFirst.headers.etag
      }
    })

    // expect HTTP 304 Not Modified without payload
    expect(resSecond.statusCode).to.equal(304)
    expect(resSecond.rawPayload).to.be.empty()
  })

  it('return 304 Not Modified if /ipfs/ was requested with any If-Modified-Since', async () => {
    const cid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

    // Get file first to simulate caching it and reading Etag
    const resFirst = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + cid
    })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['cache-control']).to.equal('public, max-age=29030400, immutable')

    // second request, this time with If-Modified-Since equal present
    const resSecond = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + cid,
      headers: {
        'If-Modified-Since': new Date().toUTCString()
      }
    })

    // expect HTTP 304 Not Modified without payload
    expect(resSecond.statusCode).to.equal(304)
    expect(resSecond.rawPayload).to.be.empty()
  })

  it('return proper Content-Disposition if ?filename=foo is included in URL', async () => {
    const cid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

    // Get file first to simulate caching it and reading Etag
    const resFirst = await gateway.inject({
      method: 'GET',
      url: `/ipfs/${cid}?filename=pretty-name-in-utf8-%C3%B3%C3%B0%C5%9B%C3%B3%C3%B0%C5%82%C4%85%C5%9B%C5%81.txt`
    })
    expect(resFirst.statusCode).to.equal(200)
    expect(resFirst.headers['etag']).to.equal(`"${cid}"`)
    expect(resFirst.headers['content-disposition']).to.equal('inline; filename*=UTF-8\'\'pretty-name-in-utf8-%C3%B3%C3%B0%C5%9B%C3%B3%C3%B0%C5%82%C4%85%C5%9B%C5%81.txt')
  })

  it('load a big file (15MB)', async () => {
    const bigFileHash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + bigFileHash
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.rawPayload).to.eql(bigFile)
    expect(res.headers['content-length']).to.equal(res.rawPayload.length).to.equal(15000000)
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${bigFileHash}`)
    expect(res.headers['etag']).to.equal(`"${bigFileHash}"`)
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['content-type']).to.equal('application/octet-stream')
  })

  it('load specific byte range of a file (from-)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileCid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    const fileLength = 12
    const range = { from: 1, length: 11 }

    // get full file first to read accept-ranges and etag headers
    const resFull = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid
    })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length).to.equal(fileLength)

    // extract expected chunk of interest
    const rangeValue = `bytes=${range.from}-`
    const expectedChunk = resFull.rawPayload.slice(range.from)

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.length}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length).to.equal(range.length)
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${fileCid}`)
    expect(resRange.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  it('load specific byte range of a file (from-to)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileCid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    const fileLength = 12
    const range = { from: 1, to: 3, length: 3 }

    // get full file first to read accept-ranges and etag headers
    const resFull = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid
    })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length).to.equal(fileLength)

    // extract expected chunk of interest
    const rangeValue = `bytes=${range.from}-${range.to}`
    const expectedChunk = resFull.rawPayload.slice(range.from, range.to + 1) // include end

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.to}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length).to.equal(range.length)
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${fileCid}`)
    expect(resRange.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  // This one is tricky, as "-to" does not mean implicit "0-to",
  // but "give me last N bytes"
  // More at https://tools.ietf.org/html/rfc7233#section-2.1
  it('load specific byte range of a file (-tail AKA bytes from end)', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileCid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    const fileLength = 12
    const range = { tail: 7, from: 5, to: 11, length: 7 }

    // get full file first to read accept-ranges and etag headers
    const resFull = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid
    })
    expect(resFull.statusCode).to.equal(200)
    expect(resFull.headers['accept-ranges']).to.equal('bytes')
    expect(resFull.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resFull.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resFull.headers['content-length']).to.equal(resFull.rawPayload.length).to.equal(fileLength)

    // extract expected chunk of interest
    const rangeValue = `bytes=-${range.tail}`
    const expectedChunk = resFull.rawPayload.slice(range.from, range.to + 1) // include end

    // const expectedChunkBytes = resFull.rawPayload.slice(range.from, range.to)
    const resRange = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid,
      headers: {
        'range': rangeValue,
        'if-range': resFull.headers.etag // if-range is meaningless for immutable /ipfs/, but will matter for /ipns/
      }
    })

    // range headers
    expect(resRange.statusCode).to.equal(206)
    expect(resRange.headers['content-range']).to.equal(`bytes ${range.from}-${range.to}/${fileLength}`)
    expect(resRange.headers['content-length']).to.equal(resRange.rawPayload.length).to.equal(range.length)
    expect(resRange.headers['accept-ranges']).to.equal(undefined)
    expect(resRange.rawPayload).to.deep.equal(expectedChunk)
    // regular headers that should also be present
    expect(resRange.headers['x-ipfs-path']).to.equal(`/ipfs/${fileCid}`)
    expect(resRange.headers['etag']).to.equal(`"${fileCid}"`)
    expect(resRange.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(resRange.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(resRange.headers['content-type']).to.equal('application/octet-stream')
  })

  it('return 416 (Range Not Satisfiable) on invalid range request', async () => {
    // use 12 byte text file to make it easier to debug ;-)
    const fileCid = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    // requesting range outside of file length
    const rangeValue = 'bytes=42-100'

    // const expectedChunkBytes = bigFile.slice(range.from, range.to)
    const resRange = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + fileCid,
      headers: { 'range': rangeValue }
    })

    // Expect 416 Range Not Satisfiable
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416
    expect(resRange.statusCode).to.equal(416)
    expect(resRange.headers['content-range']).to.equal('bytes */12')
    expect(resRange.headers['cache-control']).to.equal('no-cache')
  })

  it('load a jpg file', async () => {
    const kitty = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/cat.jpg'
    const kittyDirectCid = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + kitty
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length).to.equal(443230)
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + kitty)
    expect(res.headers['etag']).to.equal(`"${kittyDirectCid}"`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers.etag).to.equal('"Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeidsg6t7ici2osxjkukisd5inixiunqdpq2q5jy4a2ruzdf6ewsqk4')

    const fileSignature = await FileType.fromBuffer(res.rawPayload)
    expect(fileSignature.mime).to.equal('image/jpeg')
    expect(fileSignature.ext).to.equal('jpg')
  })

  it('load a svg file (unsniffable)', async () => {
    const hexagons = 'QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F/hexagons.svg'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + hexagons
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a svg file with xml leading declaration (unsniffable)', async () => {
    const hexagons = 'QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F/hexagons-xml.svg'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + hexagons
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a directory', async () => {
    const dir = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers.suborigin).to.equal('ipfs000bafybeidsg6t7ici2osxjkukisd5inixiunqdpq2q5jy4a2ruzdf6ewsqk4')

    // check if the cat picture is in the payload as a way to check
    // if this is an index of this directory
    const listedFile = res.payload.match(/\/ipfs\/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ\/cat\.jpg/g)
    expect(listedFile).to.have.lengthOf(1)
  })

  it('load a webpage index.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/index.html'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal('"Qma6665X5k3zti8nKy7gmXK2BndNDSkgmANpV6k3FUjUeg"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeigccfheqv7upr4k64bkg5b5wiwelunyn2l2rbirmm43m34lcpuqqe')
    expect(res.rawPayload).to.deep.equal(directoryContent['index.html'])
  })

  it('load a webpage {hash}/nested-folder/nested.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/nested-folder/nested.html'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal('"QmUBKGqJWiJYMrNed4bKsbo1nGYGmY418WCc2HgcwRvmHc"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeigccfheqv7upr4k64bkg5b5wiwelunyn2l2rbirmm43m34lcpuqqe')
    expect(res.rawPayload).to.deep.equal(directoryContent['nested-folder/nested.html'])
  })

  it('redirect to generated index', async () => {
    const dir = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res.statusCode).to.equal(301)
    expect(res.headers.location).to.equal('/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/')
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
  })

  it('redirect to a directory with index.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi' // note lack of '/' at the end

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    // we expect redirect to the same path but with '/' at the end
    expect(res.statusCode).to.equal(301)
    expect(res.headers.location).to.equal(`/ipfs/${dir}/`)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
  })

  it('load a directory with index.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/' // note '/' at the end

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    // confirm payload is index.html
    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal('"Qma6665X5k3zti8nKy7gmXK2BndNDSkgmANpV6k3FUjUeg"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeigccfheqv7upr4k64bkg5b5wiwelunyn2l2rbirmm43m34lcpuqqe')
    expect(res.rawPayload).to.deep.equal(directoryContent['index.html'])
  })

  it('test(gateway): load from URI-encoded path', async () => {
    // non-ascii characters will be URI-encoded by the browser
    const utf8path = '/ipfs/QmaRdtkDark8TgXPdDczwBneadyF44JvFGbrKLTkmTUhHk/cat-with-óąśśł-and-أعظم._.jpg'
    const escapedPath = encodeURI(utf8path) // this is what will be actually requested
    const res = await gateway.inject({
      method: 'GET',
      url: escapedPath
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['x-ipfs-path']).to.equal(escapedPath)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['last-modified']).to.equal('Thu, 01 Jan 1970 00:00:01 GMT')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal('"Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeiftsm4u7cn24bn2suwg3x7sldx2uplvfylsk3e4bgylyxwjdevhqm')
  })

  it('load a file from IPNS', async () => {
    const { id } = await http.api._ipfs.id()
    const ipnsPath = `/ipns/${id}/cat.jpg`

    const res = await gateway.inject({
      method: 'GET',
      url: ipnsPath
    })

    const kittyDirectCid = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u'

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['content-length']).to.equal(res.rawPayload.length).to.equal(443230)
    expect(res.headers['x-ipfs-path']).to.equal(ipnsPath)
    expect(res.headers['etag']).to.equal(`"${kittyDirectCid}"`)
    expect(res.headers['cache-control']).to.equal('no-cache') // TODO: should be record TTL
    expect(res.headers['last-modified']).to.equal(undefined)
    expect(res.headers.etag).to.equal('"Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u"')
    expect(res.headers.suborigin).to.equal(`ipns000${new CID(id).toV1().toBaseEncodedString('base32')}`)

    const fileSignature = await FileType.fromBuffer(res.rawPayload)
    expect(fileSignature.mime).to.equal('image/jpeg')
    expect(fileSignature.ext).to.equal('jpg')
  })

  it('load a directory from IPNS', async () => {
    const { id } = await http.api._ipfs.id()
    const ipnsPath = `/ipns/${id}/`

    const res = await gateway.inject({
      method: 'GET',
      url: ipnsPath
    })

    expect(res).to.have.property('statusCode', 200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal(ipnsPath)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers['last-modified']).to.equal(undefined)
    expect(res.headers['content-length']).to.equal(res.rawPayload.length)
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(`ipns000${new CID(id).toV1().toBaseEncodedString('base32')}`)

    // check if the cat picture is in the payload as a way to check
    // if this is an index of this directory
    const listedFile = res.payload.match(/\/cat\.jpg/g)
    expect(listedFile).to.have.lengthOf(1)
  })
})
