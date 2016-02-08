'use strict'

const isNode = !global.window

describe('ls', function () {
  it('should correctly retrieve links', function (done) {
    if (!isNode) return done()

    apiClients['a'].ls('QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg', (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.a.property('Objects')
      expect(res.Objects[0]).to.have.a.property('Links')
      expect(res.Objects[0]).to.have.property('Hash', 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
      done()
    })
  })

  it('should correctly handle a nonexisting hash', function (done) {
    apiClients['a'].ls('surelynotavalidhashheh?', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  it('should correctly handle a nonexisting path', function (done) {
    if (!isNode) return done()

    apiClients['a'].ls('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj/folder_that_isnt_there', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  describe('promise', () => {
    it('should correctly retrieve links', () => {
      if (!isNode) return

      return apiClients['a'].ls('QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
        .then((res) => {
          expect(res).to.have.a.property('Objects')
          expect(res.Objects[0]).to.have.a.property('Links')
          expect(res.Objects[0]).to.have.property('Hash', 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
        })
    })

    it('should correctly handle a nonexisting hash', () => {
      return apiClients['a'].ls('surelynotavalidhashheh?')
        .catch((err) => {
          expect(err).to.exist
        })
    })

    it('should correctly handle a nonexisting path', () => {
      if (!isNode) return

      return apiClients['a'].ls('QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj/folder_that_isnt_there')
        .catch((err) => {
          expect(err).to.exist
        })
    })
  })
})
