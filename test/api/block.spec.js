'use strict'

describe('.block', () => {
  const blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
  const blorb = Buffer('blorb')

  it('block.put', done => {
    apiClients['a'].block.put(blorb, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Key', 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      done()
    })
  })

  it('block.get', done => {
    apiClients['a'].block.get(blorbKey, (err, res) => {
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
})
