/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('object', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('new', () => {
    return ipfs('object new').then((out) => {
      expect(out).to.eql(
        'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      )
    })
  })

  it('new unixfs-dir', () => {
    return ipfs('object new unixfs-dir').then((out) => {
      expect(out).to.eql(
        'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
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

  it('put', () => {
    return ipfs('object put test/test-data/node.json').then((out) => {
      expect(out).to.eql(
        'added QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
      )
    })
  })

  it('stat', () => {
    return ipfs('object stat QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql([
        'NumLinks: 1',
        'BlockSize: 60',
        'LinksSize: 53',
        'DataSize: 7',
        'CumulativeSize: 68'
      ].join('\n'))
    })
  })

  it('data', () => {
    return ipfs('object data QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql('another')
    })
  })

  it('links', () => {
    return ipfs('object links QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm').then((out) => {
      expect(out).to.eql(
        'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link'
      )
    })
  })

  describe('patch', () => {
    it('append-data', () => {
      return ipfs('object patch append-data QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n test/test-data/badconfig').then((out) => {
        expect(out).to.eql(
          'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6'
        )
      })
    })

    it('set-data', () => {
      return ipfs('object patch set-data QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6 test/test-data/badconfig').then((out) => {
        expect(out).to.eql(
          'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6'
        )
      })
    })

    it('add-link', () => {
      return ipfs('object patch add-link QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n foo QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn').then((out) => {
        expect(out).to.eql(
          'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK'
        )
      })
    })

    it('rm-link', () => {
      return ipfs('object patch rm-link QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK foo').then((out) => {
        expect(out).to.eql(
          'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        )
      })
    })
  })
}))
