'use strict'

describe('.pin', () => {
  it('.pin.add', done => {
    apiClients['b'].pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
      expect(err).to.not.exist
      expect(res.Pinned[0]).to.be.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('.pin.list', done => {
    apiClients['b'].pin.list((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.pin.remove', done => {
    apiClients['b'].pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      apiClients['b'].pin.list('direct', (err, res) => {
        expect(err).to.not.exist
        expect(res).to.exist
        expect(res.Keys).to.be.empty
        done()
      })
    })
  })
})
