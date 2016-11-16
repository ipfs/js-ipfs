/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Stream = require('stream')
const IPFSFactory = require('../../utils/factory-core')
const factory = new IPFSFactory()

describe('floodsub', () => {
  let nodeOffline
  let nodeA
  let subscription

  const topic = 'nonscents'

  before((done) => {
    factory.spawnNode((err, ipfsOff) => {
      expect(err).to.not.exist
      ipfsOff.goOffline((err) => {
        expect(err).to.not.exist
        nodeOffline = ipfsOff
        factory.spawnNode((err, ipfs) => {
          expect(err).to.not.exist
          nodeA = ipfs
          done()
        })
      })
    })
  })

  after((done) => {
    factory.dismantle(() => done())
  })

  describe('Floodsub API', () => {
    describe('start', () => {
      it('throws if offline', () => {
        expect(() => nodeOffline.floodsub.start()).to.throw
      })

      it('success', () => {
        expect(nodeA.floodsub.start()).to.exist
      })
    })

    describe('sub', () => {
      it('throws if offline', () => {
        expect(() => nodeOffline.floodsub.sub()).to.throw
      })

      it('throws without a topic', () => {
        expect(() => nodeA.floodsub.sub()).to.throw
      })

      it('success', (done) => {
        nodeA.floodsub.sub(topic, (err, stream) => {
          expect(err).to.not.exist
          expect(stream.readable).to.eql(true)
          expect(typeof stream._read).to.eql('function')
          expect(typeof stream.cancel).to.eql('function')
          expect(stream instanceof Stream).to.eql(true)
          subscription = stream
          done()
        })
      })
    })

    describe('pub', () => {
      it('throws if offline', () => {
        expect(() => nodeOffline.floodsub.pub()).to.throw
      })

      it('throws without a topic', () => {
        expect(() => nodeA.floodsub.sub()).to.throw
      })

      it('throws without data', () => {
        expect(() => nodeA.floodsub.sub(topic)).to.throw
      })

      it('success', (done) => {
        const published = true

        subscription.on('data', () => done())

        nodeA.floodsub.pub(topic, 'some data', () => {
          expect(published).to.eql(true)
        })
      })
    })
  })
})
