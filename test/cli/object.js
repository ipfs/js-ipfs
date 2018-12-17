/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
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

  it('new', () => {
    return ipfs('object new').then((out) => {
      expect(out).to.eql(
        'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n'
      )
    })
  })

  it('new unixfs-dir', () => {
    return ipfs('object new unixfs-dir').then((out) => {
      expect(out).to.eql(
        'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn\n'
      )
    })
  })

  // TODO: unskip after switch to v1 CIDs by default
  it.skip('should new and print CID encoded in specified base', () => {
    return ipfs('object new --cid-base=base64').then((out) => {
      expect(out).to.eql(
        'mAXASIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhV\n'
      )
    })
  })

  it('get', () => {
    return ipfs('object get QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n').then((out) => {
      const result = JSON.parse(out)
      expect(result.Links).to.eql([])
      expect(result.Data).to.eql('')
    })
  })

  it('get with data', function () {
    this.timeout(15 * 1000)

    return ipfs('object new')
      .then((out) => out.trim())
      .then((hash) => ipfs(`object patch set-data ${hash} test/fixtures/test-data/hello`))
      .then((out) => out.trim())
      .then((hash) => ipfs(`object get ${hash}`))
      .then((out) => {
        const result = JSON.parse(out)
        expect(result.Data).to.eql('aGVsbG8gd29ybGQK')
      })
  })

  it('get while overriding data-encoding', function () {
    this.timeout(15 * 1000)

    return ipfs('object new')
      .then((out) => out.trim())
      .then((hash) => ipfs(`object patch set-data ${hash} test/fixtures/test-data/hello`))
      .then((out) => out.trim())
      .then((hash) => ipfs(`object get --data-encoding=utf8 ${hash}`))
      .then((out) => {
        const result = JSON.parse(out)
        expect(result.Data).to.eql('hello world\n')
      })
  })

  it('should get and print CIDs encoded in specified base', () => {
    return ipfs('add test/fixtures/planets -r --cid-version=1')
      .then(out => {
        const lines = out.trim().split('\n')
        return lines[lines.length - 1].split(' ')[1]
      })
      .then(cid => ipfs(`object get ${cid} --cid-base=base64`))
      .then(out => {
        const result = JSON.parse(out)
        expect(multibase.isEncoded(result.Hash)).to.deep.equal('base64')
        result.Links.forEach(l => {
          expect(multibase.isEncoded(l.Hash)).to.deep.equal('base64')
        })
      })
  })

  it('put', () => {
    return ipfs('object put test/fixtures/test-data/node.json').then((out) => {
      expect(out).to.eql(
        'added QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm\n'
      )
    })
  })

  // TODO: unskip after switch to v1 CIDs by default
  it.skip('should put and print CID encoded in specified base', () => {
    return ipfs('object put test/fixtures/test-data/node.json --cid-base=base64')
      .then((out) => {
        expect(out).to.eql(
          'added mAXASIKbM02Neyt6L1RRLYVEOuNlqDOzTvBboo3cI/u6f/+Vk\n'
        )
      })
  })

  it('stat', function () {
    this.timeout(40 * 1000)

    return ipfs('object stat QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql([
        'NumLinks: 1',
        'BlockSize: 60',
        'LinksSize: 53',
        'DataSize: 7',
        'CumulativeSize: 68'
      ].join('\n') + '\n')
    })
  })

  it('data', () => {
    return ipfs('object data QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql('another')
    })
  })

  it('unaltered data', function () {
    this.timeout(10 * 1000)

    // has to be big enough to span several DAGNodes
    const data = crypto.randomBytes(1024 * 300)
    const file = path.join(os.tmpdir(), `file-${Math.random()}.txt`)

    fs.writeFileSync(file, data)

    return ipfs(`add ${file}`)
      .then((out) => {
        return ipfs.raw(`object data ${out.split(' ')[1]}`)
      })
      .then((out) => {
        const meta = UnixFs.unmarshal(out)

        expect(meta.type).to.equal('file')
        expect(meta.fileSize()).to.equal(data.length)
      })
  })

  it('links', () => {
    return ipfs('object links QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link\n'
      )
    })
  })

  it('should get links and print CIDs encoded in specified base', () => {
    return ipfs('add test/fixtures/planets -r --cid-version=1')
      .then(out => {
        const lines = out.trim().split('\n')
        return lines[lines.length - 1].split(' ')[1]
      })
      .then(cid => ipfs(`object links ${cid} --cid-base=base64`))
      .then(out => {
        out.trim().split('\n').forEach(line => {
          const cid = line.split(' ')[0]
          expect(multibase.isEncoded(cid)).to.deep.equal('base64')
        })
      })
  })

  describe('patch', function () {
    this.timeout(40 * 1000)

    it('append-data', () => {
      return ipfs('object patch append-data QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n test/fixtures/test-data/badconfig').then((out) => {
        expect(out).to.eql(
          'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6\n'
        )
      })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should append-data and print CID encoded in specified base', () => {
      return ipfs('object patch append-data QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n test/fixtures/test-data/badconfig --cid-base=base64').then((out) => {
        expect(out).to.eql(
          'mAXASIP+BZ7jGtaTyLGOs0xYcQvH7K9kVKEbyzXAkwLoZwrRj\n'
        )
      })
    })

    it('set-data', () => {
      return ipfs('object patch set-data QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6 test/fixtures/test-data/badconfig').then((out) => {
        expect(out).to.eql(
          'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6\n'
        )
      })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should set-data and print CID encoded in specified base', () => {
      return ipfs('object patch set-data QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6 test/fixtures/test-data/badconfig --cid-base=base64').then((out) => {
        expect(out).to.eql(
          'mAXASIP+BZ7jGtaTyLGOs0xYcQvH7K9kVKEbyzXAkwLoZwrRj\n'
        )
      })
    })

    it('add-link', () => {
      return ipfs('object patch add-link QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n foo QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn').then((out) => {
        expect(out).to.eql(
          'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK\n'
        )
      })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should add-link and print CID encoded in specified base', () => {
      return ipfs('object patch add-link QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n foo QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn --cid-base=base64').then((out) => {
        expect(out).to.eql(
          'mAXASIOEVPbXq2xYoEsRZhaPB61btcy1x359osjv4a2L/lgPs\n'
        )
      })
    })

    it('rm-link', () => {
      return ipfs('object patch rm-link QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK foo').then((out) => {
        expect(out).to.eql(
          'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n'
        )
      })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should rm-link and print CID encoded in specified base', () => {
      return ipfs('object patch rm-link QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK foo --cid-base=base64').then((out) => {
        expect(out).to.eql(
          'mAXASIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhV\n'
        )
      })
    })
  })
}))
