'use strict'

describe('.block', function () {
  const blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
  const blorb = Buffer('blorb')

  it('block.put', function (done) {
    apiClients['a'].block.put(blorb, (err, res) => {
      if (err) throw err
      const store = res.Key
      assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      done()
    })
  })

  it('block.get', function (done) {
    apiClients['a'].block.get(blorbKey, (err, res) => {
      if (err) throw err

      let buf = ''
      res
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, 'blorb')
          done()
        })
    })
  })
})
