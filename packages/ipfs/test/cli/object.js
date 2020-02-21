/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')
const UnixFs = require('ipfs-unixfs')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const os = require('os')
const multibase = require('multibase')

describe('object', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('new', async () => {
    const out = await ipfs('object new')
    expect(out).to.eql(
      'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n'
    )
  })

  it('new unixfs-dir', async () => {
    const out = await ipfs('object new unixfs-dir')
    expect(out).to.eql(
      'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn\n'
    )
  })

  // TODO: unskip after switch to v1 CIDs by default
  it.skip('should new and print CID encoded in specified base', async () => {
    const out = await ipfs('object new --cid-base=base64')
    expect(out).to.eql(
      'mAXASIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhV\n'
    )
  })

  it('get', async () => {
    const out = await ipfs('object get QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    const result = JSON.parse(out)
    expect(result.Links).to.eql([])
    expect(result.Data).to.eql('')
  })

  it('get with data', async function () {
    this.timeout(15 * 1000)

    const out = await ipfs('object new')
    const out2 = await ipfs(`object patch set-data ${out.trim()} ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/hello`)
    const res = await ipfs(`object get ${out2.trim()}`)
    const result = JSON.parse(res)

    expect(result.Data).to.eql('aGVsbG8gd29ybGQK')
  })

  it('get while overriding data-encoding', async function () {
    this.timeout(15 * 1000)

    const out = await ipfs('object new')
    const out2 = await ipfs(`object patch set-data ${out.trim()} ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/hello`)
    const res = await ipfs(`object get --data-encoding=utf8 ${out2.trim()}`)
    const result = JSON.parse(res)

    expect(result.Data).to.eql('hello world\n')
  })

  it('should get and print CIDs encoded in specified base', async function () {
    this.timeout(15 * 1000)

    const out = await ipfs(`add ${path.resolve(path.join(__dirname, '..'))}/fixtures/planets -r --cid-version=1`)
    const lines = out.trim().split('\n')
    const cid = lines[lines.length - 1].split(' ')[1]
    const out2 = await ipfs(`object get ${cid} --cid-base=base64`)
    const result = JSON.parse(out2)

    expect(multibase.isEncoded(result.Hash)).to.deep.equal('base64')
    result.Links.forEach(l => {
      expect(multibase.isEncoded(l.Hash)).to.deep.equal('base64')
    })
  })

  it('put', async () => {
    const out = await ipfs(`object put ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json`)

    expect(out).to.eql(
      'added QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm\n'
    )
  })

  // TODO: unskip after switch to v1 CIDs by default
  it.skip('should put and print CID encoded in specified base', async () => {
    const out = await ipfs(`object put ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json --cid-base=base64`)

    expect(out).to.eql(
      'added mAXASIKbM02Neyt6L1RRLYVEOuNlqDOzTvBboo3cI/u6f/+Vk\n'
    )
  })

  it('stat', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('object stat QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
    expect(out).to.eql([
      'NumLinks: 1',
      'BlockSize: 60',
      'LinksSize: 53',
      'DataSize: 7',
      'CumulativeSize: 68'
    ].join('\n') + '\n')
  })

  it('data', async () => {
    const out = await ipfs('object data QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
    expect(out).to.eql('another')
  })

  it('unaltered data', async function () {
    this.timeout(10 * 1000)

    // has to be big enough to span several DAGNodes
    const data = crypto.randomBytes(1024 * 300)
    const file = path.join(os.tmpdir(), `file-${hat()}.txt`)

    fs.writeFileSync(file, data)

    const out = await ipfs(`add ${file}`)
    const out2 = await ipfs.raw(`object data ${out.split(' ')[1]}`)
    const meta = UnixFs.unmarshal(out2)

    expect(meta.type).to.equal('file')
    expect(meta.fileSize()).to.equal(data.length)
  })

  it('links', async () => {
    const out = await ipfs('object links QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
    expect(out).to.eql(
      'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
    )
  })

  it('should get links and print CIDs encoded in specified base', async () => {
    const out = await ipfs(`add ${path.resolve(path.join(__dirname, '..'))}/fixtures/planets -r --cid-version=1`)
    const lines = out.trim().split('\n')
    const cid = await lines[lines.length - 1].split(' ')[1]
    const out2 = await ipfs(`object links ${cid} --cid-base=base64`)

    out2.trim().split('\n').forEach(line => {
      const cid = line.split(' ')[0]
      expect(multibase.isEncoded(cid)).to.deep.equal('base64')
    })
  })

  describe('patch', function () {
    this.timeout(40 * 1000)

    before(async () => {
      await ipfs('object new')
    })

    it('append-data', async () => {
      const out = await ipfs(`object patch append-data QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`)
      expect(out).to.eql(
        'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6\n'
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should append-data and print CID encoded in specified base', async () => {
      const out = await ipfs(`object patch append-data QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig --cid-base=base64`)
      expect(out).to.eql(
        'mAXASIP+BZ7jGtaTyLGOs0xYcQvH7K9kVKEbyzXAkwLoZwrRj\n'
      )
    })

    it('set-data', async () => {
      const out = await ipfs(`object patch set-data QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6 ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`)
      expect(out).to.eql(
        'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6\n'
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should set-data and print CID encoded in specified base', async () => {
      const out = await ipfs(`object patch set-data QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6 ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig --cid-base=base64`)
      expect(out).to.eql(
        'mAXASIP+BZ7jGtaTyLGOs0xYcQvH7K9kVKEbyzXAkwLoZwrRj\n'
      )
    })

    it('add-link', async () => {
      const out = await ipfs('object patch add-link QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n foo QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      expect(out).to.eql(
        'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK\n'
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should add-link and print CID encoded in specified base', async () => {
      const out = await ipfs('object patch add-link QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n foo QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn --cid-base=base64')
      expect(out).to.eql(
        'mAXASIOEVPbXq2xYoEsRZhaPB61btcy1x359osjv4a2L/lgPs\n'
      )
    })

    it('rm-link', async () => {
      const out = await ipfs('object patch rm-link QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK foo')
      expect(out).to.eql(
        'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n'
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should rm-link and print CID encoded in specified base', async () => {
      const out = await ipfs('object patch rm-link QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK foo --cid-base=base64')
      expect(out).to.eql(
        'mAXASIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhV\n'
      )
    })
  })
}))
