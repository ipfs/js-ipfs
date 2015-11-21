'use strict'

describe('.dht', function () {
  it('returns an error when getting a non-existent key from the DHT',
     function (done) {
       this.timeout(20000)
       apiClients['a'].dht.get('non-existent', {timeout: '100ms'}, (err, value) => {
         assert(err)
         done()
       })
     })

  it('puts and gets a key value pair in the DHT', function (done) {
    this.timeout(20000)

    apiClients['a'].dht.put('scope', 'interplanetary', (err, res) => {
      if (err) {
        throw err
      }

      assert.equal(typeof res, 'object')

      return done()

      // non ipns or pk hashes fail to fetch, known bug
      // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
      // apiClients['a'].dht.get('scope', (err, value) => {
      //  console.log('->>', err, value)
      //  if (err) {
      //    throw err
      //  }
      //  assert.equal(value, 'interplanetary')
      //  done()
      // })
    })
  })

  it('.dht.findprovs', function (done) {
    apiClients['a'].dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      if (err) {
        throw err
      }

      assert.equal(typeof res, 'object')
      assert(res)
      done()
    })
  })
})
