'use strict'

describe('.dht', () => {
  it('returns an error when getting a non-existent key from the DHT',
     done => {
       apiClients['a'].dht.get('non-existent', {timeout: '100ms'}, (err, value) => {
         expect(err).to.be.an.instanceof(Error)
         done()
       })
     })

  it('puts and gets a key value pair in the DHT', done => {
    apiClients['a'].dht.put('scope', 'interplanetary', (err, res) => {
      expect(err).to.not.exist

      expect(res).to.be.an('array')

      done()

      // non ipns or pk hashes fail to fetch, known bug
      // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
      // apiClients['a'].dht.get('scope', (err, value) => {
      //  console.log('->>', err, value)
      //  expect(err).to.not.exist
      //  expect(value).to.be.equal('interplanetary')
      //  done()
      // })
    })
  })

  it('.dht.findprovs', done => {
    apiClients['a'].dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      expect(err).to.not.exist

      expect(res).to.be.an('array')
      done()
    })
  })
})
