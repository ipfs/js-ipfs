'use strict'

describe('.name', () => {
  let name

  it('.name.publish', done => {
    apiClients['a'].name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      expect(err).to.not.exist
      name = res
      expect(name).to.exist
      done()
    })
  })

  it('.name.resolve', done => {
    apiClients['a'].name.resolve(name.Name, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      expect(res).to.be.eql({
        Path: '/ipfs/' + name.Value
      })
      done()
    })
  })
})
