/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const Daemon = require('../../src/cli/daemon')
const loadFixture = require('aegir/fixtures')
const os = require('os')
const path = require('path')
const hat = require('hat')
const fileType = require('file-type')

const bigFile = loadFixture('test/fixtures/15mb.random', 'interface-ipfs-core')
const directoryContent = {
  'index.html': loadFixture('test/gateway/test-folder/index.html'),
  'nested-folder/hello.txt': loadFixture('test/gateway/test-folder/nested-folder/hello.txt'),
  'nested-folder/ipfs.txt': loadFixture('test/gateway/test-folder/nested-folder/ipfs.txt'),
  'nested-folder/nested.html': loadFixture('test/gateway/test-folder/nested-folder/nested.html'),
  'cat-folder/cat.jpg': loadFixture('test/gateway/test-folder/cat-folder/cat.jpg'),
  'unsniffable-folder/hexagons-xml.svg': loadFixture('test/gateway/test-folder/unsniffable-folder/hexagons-xml.svg'),
  'unsniffable-folder/hexagons.svg': loadFixture('test/gateway/test-folder/unsniffable-folder/hexagons.svg')
}

describe('HTTP Gateway', function () {
  this.timeout(80 * 1000)

  let http = {}
  let gateway

  before(async () => {
    this.timeout(60 * 1000)
    const repoPath = path.join(os.tmpdir(), '/ipfs-' + hat())

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
      }
    })

    const content = (name) => ({
      path: `test-folder/${name}`,
      content: directoryContent[name]
    })

    const emptyDir = (name) => ({ path: `test-folder/${name}` })

    await http.api.start()

    gateway = http.api._httpApi._gatewayServers[0]

    // QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi
    await http.api._ipfs.add([
      content('index.html'),
      emptyDir('empty-folder'),
      content('nested-folder/hello.txt'),
      content('nested-folder/ipfs.txt'),
      content('nested-folder/nested.html'),
      emptyDir('nested-folder/empty')
    ])
    // Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq
    await http.api._ipfs.add(bigFile)
    // QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o
    await http.api._ipfs.add(Buffer.from('hello world' + '\n'), { cidVersion: 0 })
    // QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ
    await http.api._ipfs.add([content('cat-folder/cat.jpg')])
    // QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F
    await http.api._ipfs.add([
      content('unsniffable-folder/hexagons-xml.svg'),
      content('unsniffable-folder/hexagons.svg')
    ])
  })

  after(() => http.api.stop())

  it('returns 400 for request without argument', async () => {
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs'
    })

    expect(res.statusCode).to.equal(400)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(undefined)
  })

  it('400 for request with invalid argument', async () => {
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/invalid'
    })

    expect(res.statusCode).to.equal(400)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
    expect(res.headers.suborigin).to.equal(undefined)
  })

  it('valid CIDv0', async () => {
    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    })

    expect(res.statusCode).to.equal(200)
    expect(res.rawPayload).to.eql(Buffer.from('hello world' + '\n'))
    expect(res.payload).to.equal('hello world' + '\n')
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers.etag).to.equal('"QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o"')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeicg2rebjoofv4kbyovkw7af3rpiitvnl6i7ckcywaq6xjcxnc2mby')
  })

  /* TODO when support for CIDv1 lands
  it('valid CIDv1', (done) => {
    gateway.inject({
      method: 'GET',
      url: '/ipfs/TO-DO'
    }, (res) => {
      expect(res.statusCode).to.equal(200)
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

  it('stream a large file', async () => {
    const bigFileHash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + bigFileHash
    })

    expect(res.statusCode).to.equal(200)
    expect(res.rawPayload).to.eql(bigFile)
    expect(res.headers['x-ipfs-path']).to.equal(`/ipfs/${bigFileHash}`)
    expect(res.headers['etag']).to.equal(`"${bigFileHash}"`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers['content-type']).to.equal('application/octet-stream')
  })

  it('load a jpg file', async () => {
    const kitty = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/cat.jpg'
    const kittyDirectCid = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + kitty
    })

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('image/jpeg')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + kitty)
    expect(res.headers['etag']).to.equal(`"${kittyDirectCid}"`)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
    expect(res.headers.etag).to.equal('"Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u"')
    expect(res.headers.suborigin).to.equal('ipfs000bafybeidsg6t7ici2osxjkukisd5inixiunqdpq2q5jy4a2ruzdf6ewsqk4')

    let fileSignature = fileType(res.rawPayload)
    expect(fileSignature.mime).to.equal('image/jpeg')
    expect(fileSignature.ext).to.equal('jpg')
  })

  it('load a svg file (unsniffable)', async () => {
    const hexagons = 'QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F/hexagons.svg'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + hexagons
    })

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a svg file with xml leading declaration (unsniffable)', async () => {
    const hexagons = 'QmVZoGxDvKM9KExc8gaL4uTbhdNtWhzQR7ndrY7J1gWs3F/hexagons-xml.svg'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + hexagons
    })

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('image/svg+xml')
  })

  it('load a directory', async () => {
    const dir = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('no-cache')
    expect(res.headers.etag).to.equal(undefined)
    expect(res.headers.suborigin).to.equal('ipfs000bafybeidsg6t7ici2osxjkukisd5inixiunqdpq2q5jy4a2ruzdf6ewsqk4')

    // check if the cat picture is in the payload as a way to check
    // if this is an index of this directory
    let listedFile = res.payload.match(/\/ipfs\/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ\/cat\.jpg/g)
    expect(listedFile).to.have.lengthOf(1)
  })

  it('load a webpage index.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/index.html'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
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

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
    expect(res.headers['x-ipfs-path']).to.equal('/ipfs/' + dir)
    expect(res.headers['cache-control']).to.equal('public, max-age=29030400, immutable')
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

  it('redirect to webpage index.html', async () => {
    const dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/'

    const res = await gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    })

    expect(res.statusCode).to.equal(302)
    expect(res.headers.location).to.equal('/ipfs/QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/index.html')
    expect(res.headers['x-ipfs-path']).to.equal(undefined)
  })
})
