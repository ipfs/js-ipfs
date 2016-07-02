/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

module.exports = (common) => {
  describe.only('.block', () => {
    const blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
    const blorb = Buffer('blorb')

    it('returns an error when putting an array of files', () => {
      return apiClients.a.block.put([blorb, blorb], (err) => {
        console.log(err)
        expect(err).to.be.an.instanceof(Error)
      })
    })

    it('block.put', (done) => {
      apiClients.a.block.put(blorb, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Key', 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
        done()
      })
    })

    it('block.get', (done) => {
      apiClients.a.block.get(blorbKey, (err, res) => {
        expect(err).to.not.exist

        let buf = ''
        res
          .on('data', function (data) { buf += data })
          .on('end', function () {
            expect(buf).to.be.equal('blorb')
            done()
          })
      })
    })

    it('block.stat', (done) => {
      apiClients.a.block.stat(blorbKey, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.property('Key')
        expect(res).to.have.property('Size')
        done()
      })
    })

    describe('promise', () => {
      it('returns an error when putting an array of files', () => {
        return apiClients.a.block.put([blorb, blorb])
          .catch((err) => {
            expect(err).to.be.an.instanceof(Error)
          })
      })

      it('block.put', () => {
        return apiClients.a.block.put(blorb)
          .then((res) => {
            expect(res).to.have.a.property('Key', 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
          })
      })

      it('block.get', (done) => {
        return apiClients.a.block.get(blorbKey)
          .then((res) => {
            let buf = ''
            res
              .on('data', function (data) { buf += data })
              .on('end', function () {
                expect(buf).to.be.equal('blorb')
                done()
              })
          })
      })

      it('block.stat', () => {
        return apiClients.a.block.stat(blorbKey)
          .then((res) => {
            expect(res).to.have.property('Key')
            expect(res).to.have.property('Size')
          })
      })
    })
  })
}
