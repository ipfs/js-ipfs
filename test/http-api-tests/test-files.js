/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const Readable = require('stream').Readable

module.exports = (httpAPI) => {
  describe.skip('files', () => {
    describe('api', () => {
      let api

      it('api', () => {
        api = httpAPI.server.select('API')
      })


      describe('/files/add', () => {
        it('returns 400 if no tuple is provided', (done) => {
          const form = new FormData()
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/files/add',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              done()
            })
          })
        })

        it.skip('returns 500 if tuples are invalid', (done) => {
          const form = new FormData()
          const filePath = '/home/n4th4n/Pictures/catfart.jpg'
          const filePath2 = '/home/n4th4n/Pictures/cat-test.jpg'
          //console.log(fs.readFileSync(filePath))
          //console.log(fs.readFileSync(filePath2))
          form.append('file', fs.createReadStream(filePath))
          form.append('file', fs.createReadStream(filePath2))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/files/add',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(500)
              done()
            })
          })
        })

        it('adds multiple files', (done) => {
          const form = new FormData()
          const filePath = '/home/n4th4n/Pictures/catfart.jpg'
          const filePath2 = '/home/n4th4n/Pictures/cat-test.jpg'
          form.append('test', fs.createReadStream(filePath))
          form.append('file', fs.createReadStream(filePath2))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/files/add',
              headers: headers,
              payload: payload
            }, (res) => {
              console.log(res.payload)
              expect(res.statusCode).to.equal(200)
              done()
            })
          })
        })
      })

    })

    describe('using js-ipfs-api', () => {
      var ctl

      it('start IPFS API ctl', (done) => {
        ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
        done()
      })


      describe('ipfs.add', () => {
        it('returns error if the node is invalid', (done) => {
          var files = []
          const buffered = fs.readFileSync('/home/n4th4n/Pictures/cat-test.jpg')
          const buffered2 = fs.readFileSync('/home/n4th4n/Pictures/catfart.jpg')

          const filePair = {path: 'cat-test.jpg', content: r}
          const filePair2 = {path: 'catfart.jpg', content: r2}
          files.push(filePair)
          files.push(filePair2)

          ctl.add(files, (err, res) => {
            console.log(res)
            //expect(err).to.exist
            console.log(err)
            done()
          })
        })

        it('updates value', (done) => {
          const filePath = 'test/test-data/node.json'
          const expectedResult = {
            Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
            Links: [{
              Name: 'some link',
              Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
              Size: 8
            }]
          }

          ctl.object.put(filePath, 'json', (err, res) => {
            expect(err).not.to.exist
            expect(res).to.deep.equal(expectedResult)
            done()
          })
        })
      })

    })
  })
}
