'use strict'

describe('.version', () => {
  // note, IPFS HTTP-API returns always the same object, the filtering
  // happens on the CLI
  it('checks the version', done => {
    apiClients['a'].version((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with number option', done => {
    apiClients['a'].version({number: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with commit option', done => {
    apiClients['a'].version({commit: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with repo option', done => {
    apiClients['a'].version({commit: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })
})
