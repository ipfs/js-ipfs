/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import fs from 'fs'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import * as dagPB from '@ipld/dag-pb'

describe('object', () => {
  const cid = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  let ipfs

  beforeEach(() => {
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
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  describe('new', () => {
    const defaultOptions = {
      template: undefined,
      timeout: undefined
    }

    it('should create a new object', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.new.withArgs(defaultOptions).resolves(cid)

      const out = await cli('object new', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('new unixfs-dir', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.new.withArgs({
        ...defaultOptions,
        template: 'unixfs-dir'
      }).resolves(cid)

      const out = await cli('object new unixfs-dir', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('new with a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.new.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves(cid)

      const out = await cli('object new --timeout=1s', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('should new and print CID encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.new.withArgs(defaultOptions).resolves(cid.toV1())

      const out = await cli('object new --cid-base=base64', { ipfs })
      expect(out).to.equal(
        `${cid.toV1().toString(base64)}\n`
      )
    })
  })

  describe('get', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should get an object', async () => {
      const node = {
        Links: []
      }

      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, defaultOptions).resolves(node)

      const out = await cli(`object get ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('')
    })

    it('should get an object and strip control characters from link names', async () => {
      const node = {
        Links: [{
          Name: 'derp\n\b',
          Tsize: 10,
          Hash: cid
        }]
      }

      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, defaultOptions).resolves(node)

      const out = await cli(`object get ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([{
        Name: 'derp',
        Size: 10,
        Hash: cid.toString()
      }])
      expect(result.Data).to.equal('')
    })

    it('get with data', async () => {
      const node = {
        Data: uint8ArrayFromString('aGVsbG8gd29ybGQK', 'base64'),
        Links: []
      }

      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, defaultOptions).resolves(node)

      const out = await cli(`object get ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('aGVsbG8gd29ybGQK')
    })

    it('get while overriding data-encoding', async () => {
      const node = {
        Data: uint8ArrayFromString('hello world'),
        Links: []
      }

      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, defaultOptions).resolves(node)

      const out = await cli(`object get --data-encoding=utf8 ${cid}`, { ipfs })
      const result = JSON.parse(out)
      expect(result.Links).to.deep.equal([])
      expect(result.Data).to.equal('hello world')
    })

    it('should get and print CIDs encoded in specified base', async () => {
      const node = {
        Links: [{
          Name: '',
          Tsize: 0,
          Hash: cid.toV1()
        }]
      }

      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.get.withArgs(cid.toV1(), defaultOptions).resolves(node)

      const out = await cli(`object get --cid-base=base64 ${cid.toV1()}`, { ipfs })
      const result = JSON.parse(out)

      expect(result.Hash).to.equal(cid.toV1().toString(base64))
      result.Links.forEach(l => {
        expect(l.Hash).to.equal(cid.toV1().toString(base64))
      })
    })

    it('should get an object with a timeout', async () => {
      const node = {
        Links: []
      }

      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, {
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
      timeout: undefined
    }

    it('should put an object', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.put.withArgs({}, defaultOptions).resolves(cid)

      const out = await cli('object put {}', { ipfs })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })

    it('put from pipe', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.put.withArgs({}, defaultOptions).resolves(cid)

      const out = await cli('object put', {
        ipfs,
        getStdin: function * () {
          yield Buffer.from('{}')
        }
      })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })

    it('put protobuf from pipe', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.put.withArgs({ Links: [] }, defaultOptions).resolves(cid)

      const out = await cli('object put --input-enc protobuf', {
        ipfs,
        getStdin: function * () {
          yield dagPB.encode({ Links: [] })
        }
      })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })

    it('should put and print CID encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.put.withArgs({}, defaultOptions).resolves(cid.toV1())

      const out = await cli('object put {} --cid-base=base64', { ipfs })

      expect(out).to.equal(
        `added ${cid.toV1().toString(base64)}\n`
      )
    })

    it('should put an object with a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.put.withArgs({}, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(cid)

      const out = await cli('object put {} --timeout=1s', { ipfs })

      expect(out).to.equal(
        `added ${cid}\n`
      )
    })
  })

  describe('stat', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should stat an object', async () => {
      ipfs.object.stat.withArgs(cid, defaultOptions).resolves({
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
      ipfs.object.stat.withArgs(cid, {
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
      timeout: undefined
    }

    it('should return data from an object', async () => {
      ipfs.object.data.withArgs(cid, defaultOptions).resolves(data)

      const out = await cli(`object data ${cid}`, { ipfs })
      expect(out).to.equal(data)
    })

    it('should return data from an object with a timeout', async () => {
      ipfs.object.data.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(data)

      const out = await cli(`object data ${cid} --timeout=1s`, { ipfs })
      expect(out).to.equal(data)
    })
  })

  describe('links', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should return links from an object', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.links.withArgs(cid, defaultOptions).resolves([{
        Name: 'some link',
        Tsize: 8,
        Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V')
      }])

      const out = await cli(`object links ${cid}`, { ipfs })
      expect(out).to.equal(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
      )
    })

    it('should get links and print CIDs encoded in specified base', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      const cid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
      const linkCid = CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1()

      ipfs.object.links.withArgs(cid, defaultOptions).resolves([{
        Name: 'some link',
        Tsize: 8,
        Hash: linkCid
      }])

      const out = await cli(`object links ${cid} --cid-base=base64`, { ipfs })

      out.trim().split('\n').forEach(line => {
        const cid = line.split(' ')[0]
        expect(cid).to.equal(linkCid.toString(base64))
      })
    })

    it('should return links from an object with a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.links.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).resolves([{
        Name: 'some link',
        Tsize: 8,
        Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V')
      }])

      const out = await cli(`object links ${cid} --timeout=1s`, { ipfs })
      expect(out).to.equal(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
      )
    })

    it('should get an object and strip control characters from link names', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.links.withArgs(cid, defaultOptions).resolves([{
        Name: 'derp\t\n\b',
        Tsize: 8,
        Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V')
      }])

      const out = await cli(`object links ${cid}`, { ipfs })
      expect(out).to.equal(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 derp\n'
      )
    })
  })

  describe('patch', () => {
    describe('append-data', () => {
      const defaultOptions = {
        timeout: undefined
      }

      it('should append data', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid, buf, defaultOptions).resolves(
          cid
        )

        const out = await cli(`object patch append-data ${cid} ${filePath}`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })

      it('append data from pipe', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const buf = Buffer.from('hello world')

        ipfs.object.patch.appendData.withArgs(cid, buf, defaultOptions).resolves(
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

      it('should append data and print CID encoded in specified base', async () => {
        ipfs.bases.getBase.withArgs('base64').returns(base64)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid, buf, defaultOptions).resolves(
          cid.toV1()
        )

        const out = await cli(`object patch append-data ${cid} ${filePath} --cid-base=base64`, { ipfs })
        expect(out).to.equal(`${cid.toV1().toString(base64)}\n`)
      })

      it('should append data with a timeout', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.appendData.withArgs(cid, buf, {
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
        timeout: undefined
      }

      it('should set data on an object', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid, buf, defaultOptions).resolves(
          cid
        )

        const out = await cli(`object patch set-data ${cid} ${filePath}`, { ipfs })
        expect(out).to.equal(`${cid}\n`)
      })

      it('set-data from pipe', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const buf = Buffer.from('hello world')

        ipfs.object.patch.setData.withArgs(cid, buf, defaultOptions).resolves(
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
        ipfs.bases.getBase.withArgs('base64').returns(base64)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid.toV1(), buf, defaultOptions).resolves(
          cid.toV1()
        )

        const out = await cli(`object patch set-data ${cid.toV1()} ${filePath} --cid-base=base64`, { ipfs })
        expect(out).to.equal(`${cid.toV1().toString(base64)}\n`)
      })

      it('should set data on an object with a timeout', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const filePath = 'README.md'
        const buf = fs.readFileSync(filePath)

        ipfs.object.patch.setData.withArgs(cid, buf, {
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
        timeout: undefined
      }

      it('should add a link to an object', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const linkCid = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

        ipfs.object.get.withArgs(linkCid, defaultOptions).resolves({
          Links: []
        })
        ipfs.object.patch.addLink.withArgs(cid, {
          Name: 'foo',
          Tsize: 0,
          Hash: linkCid
        }, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch add-link ${cid} foo ${linkCid}`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })

      it('should add-link and print CID encoded in specified base', async () => {
        ipfs.bases.getBase.withArgs('base64').returns(base64)
        const linkCid = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').toV1()
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()

        ipfs.object.get.withArgs(linkCid, defaultOptions).resolves({
          Links: []
        })
        ipfs.object.patch.addLink.withArgs(cid.toV1(), {
          Name: 'foo',
          Tsize: 0,
          Hash: linkCid
        }, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch add-link ${cid.toV1()} foo ${linkCid} --cid-base=base64`, { ipfs })
        expect(out).to.equal(
          `${updatedCid.toString(base64)}\n`
        )
      })

      it('should add a link to an object with a timeout', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const linkCid = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

        ipfs.object.get.withArgs(linkCid, {
          ...defaultOptions,
          timeout: 1000
        }).resolves({
          Links: []
        })
        ipfs.object.patch.addLink.withArgs(cid, {
          Name: 'foo',
          Tsize: 0,
          Hash: linkCid
        }, {
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
        timeout: undefined
      }

      it('should remove a link from an object', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const cid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid, linkName, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch rm-link ${cid} ${linkName}`, { ipfs })
        expect(out).to.equal(
          `${updatedCid}\n`
        )
      })

      it('should rm-link and print CID encoded in specified base', async () => {
        ipfs.bases.getBase.withArgs('base64').returns(base64)
        const cid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').toV1()
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid, linkName, defaultOptions).resolves(
          updatedCid
        )

        const out = await cli(`object patch rm-link ${cid} ${linkName} --cid-base=base64`, { ipfs })
        expect(out).to.equal(
          `${updatedCid.toString(base64)}\n`
        )
      })

      it('should remove a link from an object with a timeout', async () => {
        ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
        const cid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const updatedCid = CID.parse('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        const linkName = 'foo'

        ipfs.object.patch.rmLink.withArgs(cid, linkName, {
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
