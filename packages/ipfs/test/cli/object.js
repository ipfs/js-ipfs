/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const path = require('path')
const fs = require('fs')
const multibase = require('multibase')
const cli = require('../utils/cli')
const sinon = require('sinon')
const CID = require('cids')
const { Buffer } = require('buffer')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

describe('object', () => {
  let ipfs

  before(() => {
    ipfs = {
      object: {
        new: sinon.stub(),
        get: sinon.stub(),
        put: sinon.stub(),
        stat: sinon.stub(),
        data: sinon.stub(),
        links: sinon.stub(),
        patch: {
          appendData: sinon.stub(),
          addLink: sinon.stub(),
          setData: sinon.stub(),
          rmLink: sinon.stub()
        }
      }
    }
  })

  it('new', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

    ipfs.object.new.withArgs(undefined).resolves(cid)

    const out = await cli('object new', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('new unixfs-dir', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

    ipfs.object.new.withArgs('unixfs-dir').resolves(cid)

    const out = await cli('object new unixfs-dir', { ipfs })
    expect(out).to.equal(`${cid}\n`)
  })

  it('should new and print CID encoded in specified base', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').toV1()

    ipfs.object.new.withArgs(undefined).resolves(cid)

    const out = await cli('object new --cid-base=base64', { ipfs })
    expect(out).to.equal(
      'mAXASIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhV\n'
    )
  })

  it('get', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    const node = new DAGNode()

    ipfs.object.get.withArgs(cid.toString(), { enc: 'base58' }).resolves(node)

    const out = await cli(`object get ${cid}`, { ipfs })
    const result = JSON.parse(out)
    expect(result.Links).to.deep.equal([])
    expect(result.Data).to.equal('')
  })

  it('get with data', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    const node = new DAGNode(Buffer.from('aGVsbG8gd29ybGQK', 'base64'))

    ipfs.object.get.withArgs(cid.toString(), { enc: 'base58' }).resolves(node)

    const out = await cli(`object get ${cid}`, { ipfs })
    const result = JSON.parse(out)
    expect(result.Links).to.deep.equal([])
    expect(result.Data).to.equal('aGVsbG8gd29ybGQK')
  })

  it('get while overriding data-encoding', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    const node = new DAGNode(Buffer.from('hello world'))

    ipfs.object.get.withArgs(cid.toString(), { enc: 'base58' }).resolves(node)

    const out = await cli(`object get --data-encoding=utf8 ${cid}`, { ipfs })
    const result = JSON.parse(out)
    expect(result.Links).to.deep.equal([])
    expect(result.Data).to.equal('hello world')
  })

  it('should get and print CIDs encoded in specified base', async () => {
    const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').toV1()
    const node = new DAGNode(null, [
      new DAGLink('', 0, cid)
    ])

    ipfs.object.get.withArgs(cid.toString(), { enc: 'base58' }).resolves(node)

    const out = await cli(`object get --cid-base=base64 ${cid}`, { ipfs })
    const result = JSON.parse(out)

    expect(multibase.isEncoded(result.Hash)).to.deep.equal('base64')
    result.Links.forEach(l => {
      expect(multibase.isEncoded(l.Hash)).to.deep.equal('base64')
    })
  })

  it('put', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

    ipfs.object.put.withArgs(sinon.match.instanceOf(Buffer), { enc: 'json' }).resolves(cid)

    const out = await cli(`object put ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json`, { ipfs })

    expect(out).to.equal(
      `added ${cid}\n`
    )
  })

  it('put from pipe', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
    const buf = Buffer.from('hello world')

    ipfs.object.put.withArgs(buf, { enc: 'json' }).resolves(cid)

    const out = await cli('object put', {
      ipfs,
      getStdin: function * () {
        yield buf
      }
    })

    expect(out).to.equal(
      `added ${cid}\n`
    )
  })

  it('should put and print CID encoded in specified base', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
    const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json`
    const buf = fs.readFileSync(filePath)

    ipfs.object.put.withArgs(buf, { enc: 'json' }).resolves(cid)

    const out = await cli(`object put ${filePath} --cid-base=base64`, { ipfs })

    expect(out).to.equal(
      'added mAXASIKbM02Neyt6L1RRLYVEOuNlqDOzTvBboo3cI/u6f/+Vk\n'
    )
  })

  it('stat', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

    ipfs.object.stat.withArgs(cid.toString()).resolves({
      Hash: cid,
      NumLinks: 1,
      BlockSize: 60,
      LinksSize: 53,
      DataSize: 7,
      CumulativeSize: 68
    })

    const out = await cli(`object stat ${cid}`, { ipfs })
    expect(out).to.deep.equal([
      'NumLinks: 1',
      'BlockSize: 60',
      'LinksSize: 53',
      'DataSize: 7',
      'CumulativeSize: 68'
    ].join('\n') + '\n')
  })

  it('data', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
    const data = 'another'

    ipfs.object.data.withArgs(cid.toString(), { enc: 'base58' }).resolves(data)

    const out = await cli(`object data ${cid}`, { ipfs })
    expect(out).to.equal(data)
  })

  it('links', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

    ipfs.object.links.withArgs(cid.toString(), { enc: 'base58' }).resolves([
      new DAGLink('some link', 8, new CID('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V'))
    ])

    const out = await cli(`object links ${cid}`, { ipfs })
    expect(out).to.equal(
      'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
    )
  })

  it('should get links and print CIDs encoded in specified base', async () => {
    const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()

    ipfs.object.links.withArgs(cid.toString(), { enc: 'base58' }).resolves([
      new DAGLink('some link', 8, new CID('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1())
    ])

    const out = await cli(`object links ${cid} --cid-base=base64`, { ipfs })

    out.trim().split('\n').forEach(line => {
      const cid = line.split(' ')[0]
      expect(multibase.isEncoded(cid)).to.deep.equal('base64')
    })
  })

  describe('patch', () => {
    it('append-data', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
      const buf = fs.readFileSync(filePath)

      ipfs.object.patch.appendData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch append-data ${cid} ${filePath}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('append-data from pipe', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const buf = Buffer.from('hello world')

      ipfs.object.patch.appendData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch append-data ${cid}`, {
        ipfs,
        getStdin: function * () {
          yield buf
        }
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('should append-data and print CID encoded in specified base', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
      const buf = fs.readFileSync(filePath)

      ipfs.object.patch.appendData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch append-data ${cid} ${filePath} --cid-base=base64`, { ipfs })
      expect(out).to.equal(`${cid.toString('base64')}\n`)
    })

    it('set-data', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
      const buf = fs.readFileSync(filePath)

      ipfs.object.patch.setData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch set-data ${cid} ${filePath}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('set-data from pipe', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const buf = Buffer.from('hello world')

      ipfs.object.patch.setData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch set-data ${cid}`, {
        ipfs,
        getStdin: function * () {
          yield buf
        }
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('should set-data and print CID encoded in specified base', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
      const buf = fs.readFileSync(filePath)

      ipfs.object.patch.setData.withArgs(cid.toString(), buf, { enc: 'base58' }).resolves(
        cid
      )

      const out = await cli(`object patch set-data ${cid} ${filePath} --cid-base=base64`, { ipfs })
      expect(out).to.equal(`${cid.toString('base64')}\n`)
    })

    it('add-link', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const linkCid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

      ipfs.object.get.withArgs(linkCid.toString(), { enc: 'base58' }).resolves(
        new DAGNode()
      )
      ipfs.object.patch.addLink.withArgs(cid.toString(), sinon.match.instanceOf(DAGLink), { enc: 'base58' }).resolves(
        updatedCid
      )

      const out = await cli(`object patch add-link ${cid} foo ${linkCid}`, { ipfs })
      expect(out).to.equal(
        `${updatedCid}\n`
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it('should add-link and print CID encoded in specified base', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const linkCid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').toV1()
      const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()

      ipfs.object.get.withArgs(linkCid.toString(), { enc: 'base58' }).resolves(
        new DAGNode()
      )
      ipfs.object.patch.addLink.withArgs(cid.toString(), sinon.match.instanceOf(DAGLink), { enc: 'base58' }).resolves(
        updatedCid
      )

      const out = await cli(`object patch add-link ${cid} foo ${linkCid} --cid-base=base64`, { ipfs })
      expect(out).to.equal(
        `${updatedCid.toString('base64')}\n`
      )
    })

    it('rm-link', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
      const linkName = 'foo'

      ipfs.object.patch.rmLink.withArgs(cid.toString(), { name: linkName }, { enc: 'base58' }).resolves(
        updatedCid
      )

      const out = await cli(`object patch rm-link ${cid} ${linkName}`, { ipfs })
      expect(out).to.equal(
        `${updatedCid}\n`
      )
    })

    // TODO: unskip after switch to v1 CIDs by default
    it('should rm-link and print CID encoded in specified base', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const linkName = 'foo'

      ipfs.object.patch.rmLink.withArgs(cid.toString(), { name: linkName }, { enc: 'base58' }).resolves(
        updatedCid
      )

      const out = await cli(`object patch rm-link ${cid} ${linkName} --cid-base=base64`, { ipfs })
      expect(out).to.equal(
        `${updatedCid.toString('base64')}\n`
      )
    })
  })
})
