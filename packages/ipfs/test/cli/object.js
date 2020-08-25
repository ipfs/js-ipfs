/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const path = require('path')
const fs = require('fs')
const multibase = require('multibase')
const cli = require('../utils/cli')
const sinon = require('sinon')
const CID = require('cids')
const uint8ArrayFromString = require('uint8arrays/from-string')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

describe('object', () => {
  const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
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

  describe('new', () => {
    const defaultOptions = {
      template: undefined,
      timeout: undefined
    }

    it('should create a new object', async () => {
      ipfs.object.new.withArgs(defaultOptions).resolves(cid)

      const out = await cli('object new', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('new unixfs-dir', async () => {
      ipfs.object.new.withArgs({
        ...defaultOptions,
        template: 'unixfs-dir'
      }).resolves(cid)

      const out = await cli('object new unixfs-dir', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('new with a timeout', async () => {
      ipfs.object.new.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves(cid)

      const out = await cli('object new --timeout=1s', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('should new and print CID encoded in specified base', async () => {
      ipfs.object.new.withArgs(defaultOptions).resolves(cid.toV1())

      const out = await cli('object new --cid-base=base64', { ipfs })
      expect(out).to.equal(
        `${cid.toV1().toString('base64')}\n`
      )
    })
  })

  describe('get', () => {
    const defaultOptions = {
      enc: 'base58',
      timeout: undefined
    }

    it('should get an object', async () => {
      const node = new DAGNode()

      ipfs.object.get.withArgs(cid.toString(), defaultOptions).resolves(node)

      const out = await cli(`object get ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('')
    })

    it('get with data', async () => {
      const node = new DAGNode(uint8ArrayFromString('aGVsbG8gd29ybGQK', 'base64'))

      ipfs.object.get.withArgs(cid.toString(), defaultOptions).resolves(node)

      const out = await cli(`object get ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('aGVsbG8gd29ybGQK')
    })

    it('get while overriding data-encoding', async () => {
      const node = new DAGNode(uint8ArrayFromString('hello world'))

      ipfs.object.get.withArgs(cid.toString(), defaultOptions).resolves(node)

      const out = await cli(`object get --data-encoding=utf8 ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('hello world')
    })

    it('should get and print CIDs encoded in specified base', async () => {
      const node = new DAGNode(null, [
        new DAGLink('', 0, cid.toV1())
      ])

      ipfs.object.get.withArgs(cid.toV1().toString(), defaultOptions).resolves(node)

      const out = await cli(`object get --cid-base=base64 ${cid.toV1()}`, { ipfs })
      const result = JSON.parse(out)

      expect(multibase.isEncoded(result.Hash)).to.deep.equal('base64')
      result.Links.forEach(l => {
        expect(multibase.isEncoded(l.Hash)).to.deep.equal('base64')
      })
    })

    it('should get an object with a timeout', async () => {
      const node = new DAGNode()

      ipfs.object.get.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves(node)

      const out = await cli(`object get ${cid} --timeout=1s`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('')
    })
  })

  describe('put', () => {
    const defaultOptions = {
      enc: 'json',
      timeout: undefined
    }

    it('should put an object', async () => {
      ipfs.object.put.withArgs(sinon.match.instanceOf(Uint8Array), defaultOptions).resolves(cid)

      const out = await cli(`object put ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json`, { ipfs })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })

    it('put from pipe', async () => {
      const buf = uint8ArrayFromString('hello world')

      ipfs.object.put.withArgs(buf, defaultOptions).resolves(cid)

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
      const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json`
      const buf = fs.readFileSync(filePath)

      ipfs.object.put.withArgs(buf, defaultOptions).resolves(cid.toV1())

      const out = await cli(`object put ${filePath} --cid-base=base64`, { ipfs })

      expect(out).to.equal(
        `added ${cid.toV1().toString('base64')}\n`
      )
    })

    it('should put an object with a timeout', async () => {
      ipfs.object.put.withArgs(sinon.match.instanceOf(Uint8Array), {
        ...defaultOptions,
        timeout: 1000
      }).resolves(cid)

      const out = await cli(`object put ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/node.json --timeout=1s`, { ipfs })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })
  })

  describe('stat', () => {
    const defaultOptions = {
      enc: 'base58',
      timeout: undefined
    }

    it('should stat an object', async () => {
      ipfs.object.stat.withArgs(cid.toString(), defaultOptions).resolves({
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

    it('should stat an object with a timeout', async () => {
      ipfs.object.stat.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        Hash: cid,
        NumLinks: 1,
        BlockSize: 60,
        LinksSize: 53,
        DataSize: 7,
        CumulativeSize: 68
      })

      const out = await cli(`object stat ${cid} --timeout=1s`, { ipfs })
      expect(out).to.deep.equal([
        'NumLinks: 1',
        'BlockSize: 60',
        'LinksSize: 53',
        'DataSize: 7',
        'CumulativeSize: 68'
      ].join('\n') + '\n')
    })
  })

  describe('data', () => {
    const data = 'another'
    const defaultOptions = {
      enc: 'base58',
      timeout: undefined
    }

    it('should return data from an object', async () => {
      ipfs.object.data.withArgs(cid.toString(), defaultOptions).resolves(data)

      const out = await cli(`object data ${cid}`, { ipfs })
      expect(out).to.equal(data)
    })

    it('should return data from an object with a timeout', async () => {
      ipfs.object.data.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves(data)

      const out = await cli(`object data ${cid} --timeout=1s`, { ipfs })
      expect(out).to.equal(data)
    })
  })

  describe('links', () => {
    const defaultOptions = {
      enc: 'base58',
      timeout: undefined
    }

    it('should return links from an object', async () => {
      ipfs.object.links.withArgs(cid.toString(), defaultOptions).resolves([
        new DAGLink('some link', 8, new CID('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V'))
      ])

      const out = await cli(`object links ${cid}`, { ipfs })
      expect(out).to.equal(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
      )
    })

    it('should get links and print CIDs encoded in specified base', async () => {
      const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()

      ipfs.object.links.withArgs(cid.toString(), defaultOptions).resolves([
        new DAGLink('some link', 8, new CID('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1())
      ])

      const out = await cli(`object links ${cid} --cid-base=base64`, { ipfs })

      out.trim().split('\n').forEach(line => {
        const cid = line.split(' ')[0]
        expect(multibase.isEncoded(cid)).to.deep.equal('base64')
      })
    })

    it('should return links from an object with a timeout', async () => {
      ipfs.object.links.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).resolves([
        new DAGLink('some link', 8, new CID('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V'))
      ])

      const out = await cli(`object links ${cid} --timeout=1s`, { ipfs })
      expect(out).to.equal(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
      )
    })
  })

  describe('patch', () => {
    describe('append-data', () => {
      const defaultOptions = {
        enc: 'base58',
        timeout: undefined
      }

      it('should append data', async () => {
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid.toString(), buf, defaultOptions).resolves(
          cid
        )

        const out = await cli(`object patch append-data ${cid} ${filePath}`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })

      it('append-data from pipe', async () => {
        const buf = Buffer.from('hello world')

        ipfs.object.patch.appendData.withArgs(cid.toString(), buf, defaultOptions).resolves(
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
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid.toString(), buf, defaultOptions).resolves(
          cid.toV1()
        )

        const out = await cli(`object patch append-data ${cid} ${filePath} --cid-base=base64`, { ipfs })
        expect(out).to.equal(`${cid.toV1().toString('base64')}\n`)
      })

      it('should append data with a timeout', async () => {
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid.toString(), buf, {
          ...defaultOptions,
          timeout: 1000
        }).resolves(
          cid
        )

        const out = await cli(`object patch append-data ${cid} ${filePath} --timeout=1s`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })
    })

    describe('set-data', () => {
      const defaultOptions = {
        enc: 'base58',
        timeout: undefined
      }

      it('should set data on an object', async () => {
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid.toString(), buf, defaultOptions).resolves(
          cid
        )

        const out = await cli(`object patch set-data ${cid} ${filePath}`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })

      it('set-data from pipe', async () => {
        const buf = Buffer.from('hello world')

        ipfs.object.patch.setData.withArgs(cid.toString(), buf, defaultOptions).resolves(
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
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid.toV1().toString(), buf, defaultOptions).resolves(
          cid.toV1()
        )

        const out = await cli(`object patch set-data ${cid.toV1()} ${filePath} --cid-base=base64`, { ipfs })
        expect(out).to.equal(`${cid.toV1().toString('base64')}\n`)
      })

      it('should set data on an object with a timeout', async () => {
        const filePath = `${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/badconfig`
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid.toString(), buf, {
          ...defaultOptions,
          timeout: 1000
        }).resolves(
          cid
        )

        const out = await cli(`object patch set-data ${cid} ${filePath} --timeout=1s`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })
    })

    describe('add-link', () => {
      const defaultOptions = {
        enc: 'base58',
        timeout: undefined
      }

      it('should add a link to an object', async () => {
        const linkCid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

        ipfs.object.get.withArgs(linkCid.toString(), defaultOptions).resolves(
          new DAGNode()
        )
        ipfs.object.patch.addLink.withArgs(cid.toString(), sinon.match.instanceOf(DAGLink), defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch add-link ${cid} foo ${linkCid}`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })

      it('should add-link and print CID encoded in specified base', async () => {
        const linkCid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').toV1()
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()

        ipfs.object.get.withArgs(linkCid.toString(), defaultOptions).resolves(
          new DAGNode()
        )
        ipfs.object.patch.addLink.withArgs(cid.toV1().toString(), sinon.match.instanceOf(DAGLink), defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch add-link ${cid.toV1()} foo ${linkCid} --cid-base=base64`, { ipfs })
        expect(out).to.equal(
          `${updatedCid.toString('base64')}\n`
        )
      })

      it('should add a link to an object with a timeout', async () => {
        const linkCid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

        ipfs.object.get.withArgs(linkCid.toString(), {
          ...defaultOptions,
          timeout: 1000
        }).resolves(
          new DAGNode()
        )
        ipfs.object.patch.addLink.withArgs(cid.toString(), sinon.match.instanceOf(DAGLink), {
          ...defaultOptions,
          timeout: 1000
        }).resolves(
          updatedCid
        )

        const out = await cli(`object patch add-link ${cid} foo ${linkCid} --timeout=1s`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })
    })

    describe('rm-link', () => {
      const defaultOptions = {
        enc: 'base58',
        timeout: undefined
      }

      it('should remove a link from an object', async () => {
        const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid.toString(), { name: linkName }, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch rm-link ${cid} ${linkName}`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })

      it('should rm-link and print CID encoded in specified base', async () => {
        const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid.toString(), { name: linkName }, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch rm-link ${cid} ${linkName} --cid-base=base64`, { ipfs })
        expect(out).to.equal(
          `${updatedCid.toString('base64')}\n`
        )
      })

      it('should remove a link from an object with a timeout', async () => {
        const cid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const updatedCid = new CID('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid.toString(), { name: linkName }, {
          ...defaultOptions,
          timeout: 1000
        }).resolves(
          updatedCid
        )

        const out = await cli(`object patch rm-link ${cid} ${linkName} --timeout=1s`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })
    })
  })
})
