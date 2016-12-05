/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')

// NOTE!
// (Most of) these tests are skipped for now until we figure out the
// final data types for the messages coming over the wire

const topicName = 'js-ipfs-api-tests'

module.exports = (common, deps) => {
  // Make sure the needed dependencies are injected
  expect(deps.PubsubMessage).to.exist
  expect(deps.PubsubMessageUtils).to.exist

  const PubsubMessage = deps.PubsubMessage // eslint-disable-line no-unused-vars
  const PubsubMessageUtils = deps.PubsubMessageUtils // eslint-disable-line no-unused-vars

  // TESTS
  describe('.pubsub-message', () => {
    if (!isNode) {
      return
    }

    it.skip('create message', () => {
      // TODO
    })

    it.skip('deserialize message from JSON object', () => {
      const obj = {
        from: 'BI:ۛv�m�uyѱ����tU�+��#���V',
        data: 'aGk=',
        seqno: 'FIlj2BpyEgI=',
        topicIDs: [ topicName ]
      }
      try {
        const message = PubsubMessageUtils.deserialize(obj)
        expect(message.from).to.equal('AAA')
        expect(message.data).to.equal('hi')
        expect(message.seqno).to.equal('\u0014�c�\u001ar\u0012\u0002')
        expect(message.topicIDs.length).to.equal(1)
        expect(message.topicIDs[0]).to.equal(topicName)
      } catch (e) {
        expect(e).to.not.exist
      }
    })

    describe('immutable properties', () => {
      const sender = 'A'
      const data = 'hello'
      const seqno = '123'
      const topicIDs = ['hello world']

      const message = PubsubMessageUtils.create(sender, data, seqno, topicIDs)

      it('from', () => {
        try {
          message.from = 'not allowed'
        } catch (e) {
          expect(e).to.be.an('error')
          expect(e.toString()).to.equal(`TypeError: Cannot set property from of #<PubsubMessage> which has only a getter`)
        }
        expect(message.from).to.equal(sender)
      })

      it('data', () => {
        try {
          message.data = 'not allowed'
        } catch (e) {
          expect(e).to.be.an('error')
          expect(e.toString()).to.equal(`TypeError: Cannot set property data of #<PubsubMessage> which has only a getter`)
        }
        expect(message.data).to.equal(data)
      })

      it('seqno', () => {
        try {
          message.seqno = 'not allowed'
        } catch (e) {
          expect(e).to.be.an('error')
          expect(e.toString()).to.equal(`TypeError: Cannot set property seqno of #<PubsubMessage> which has only a getter`)
        }
        expect(message.seqno).to.equal(seqno)
      })

      it('topicIDs', () => {
        try {
          message.topicIDs = ['not allowed']
        } catch (e) {
          expect(e).to.be.an('error')
          expect(e.toString()).to.equal(`TypeError: Cannot set property topicIDs of #<PubsubMessage> which has only a getter`)
        }
        expect(message.topicIDs[0]).to.equal(topicIDs[0])
        expect(message.topicIDs.length).to.equal(topicIDs.length)
      })
    })
  })
}
