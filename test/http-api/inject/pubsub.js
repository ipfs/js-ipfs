/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (http) => {
  describe('/pubsub', () => {
    let api

    const buf = Buffer.from('some message')
    const topic = 'nonScents'
    const topicNotSubscribed = 'somethingRandom'

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    describe('/sub', () => {
      it('returns 400 if no topic is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/sub`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 200 with topic', async () => {
        // TODO: Agree on a better way to test this (currently this hangs)
        // Regarding: https://github.com/ipfs/js-ipfs/pull/644#issuecomment-267687194
        // Current Patch: Subscribe to a topic so the other tests run as expected
        const ipfs = api.app.ipfs
        const handler = (msg) => {}

        await ipfs.pubsub.subscribe(topic, handler)

        await new Promise((resolve, reject) => {
          setTimeout(() => {
            ipfs.pubsub.unsubscribe(topic, handler)
            resolve()
          }, 100)
        })
        // const res = await api.inject({
        //   method: 'GET',
        //   url: `/api/v0/pubsub/sub/${topic}`
        // })
        //   console.log(res.result)
        //   expect(res.statusCode).to.equal(200)
        //   done()
        // })
      })
    })

    describe('/pub', () => {
      it('returns 400 if no buffer is provided', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?arg=&arg=`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 200 with topic and buffer', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?arg=${topic}&arg=${buf}`
        })

        expect(res.statusCode).to.equal(200)
      })
    })

    describe.skip('/ls', () => {
      it('returns 200', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/ls`
        })
        expect(res.statusCode).to.equal(200)
        expect(res.result.Strings).to.be.eql([topic])
      })
    })

    describe('/peers', () => {
      it('returns 200 if not subscribed to a topic', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers?arg=${topicNotSubscribed}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Strings).to.be.eql([])
      })

      it('returns 200 with topic', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers?arg=${topic}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Strings).to.be.eql([])
      })
    })
  })
}
