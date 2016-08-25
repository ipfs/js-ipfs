/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('object', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('new', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'new'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
            .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          done()
        })
    })

    it('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'get', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          const result = JSON.parse(stdout[0])
          expect(result.Links)
            .to.deep.equal([])
          expect(result.Data)
            .to.equal('')
          done()
        })
    })

    it('put', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'put', process.cwd() + '/test/test-data/node.json'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
            .to.equal('added QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
          done()
        })
    })

    it('stat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'stat', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
            .to.equal('NumLinks: 1')
          expect(stdout[1])
            .to.equal('BlockSize: 60')
          expect(stdout[2])
            .to.equal('LinksSize: 53')
          expect(stdout[3])
            .to.equal('DataSize: 7')
          done()
        })
    })

    it('data', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'data', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('another')
          done()
        })
    })

    it('links', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'links', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link')
          done()
        })
    })

    describe('patch', () => {
      it('append-data', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'append-data', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', process.cwd() + '/test/test-data/badconfig'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')
            done()
          })
      })

      it('set-data', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'set-data', 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6', process.cwd() + '/test/test-data/badconfig'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')
            done()
          })
      })

      it('add-link', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'add-link', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', 'foo', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')
            done()
          })
      })

      it('rm-link', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'rm-link', 'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK', 'foo'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            done()
          })
      })
    })
  })

  // Waiting for js-ipfs-api to be updated
  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    after((done) => {
      httpAPI.stop((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('new', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'new'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
            .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          done()
        })
    })

    it('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'get', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          const result = JSON.parse(stdout[0])
          expect(result.Links)
            .to.deep.equal([])
          expect(result.Data)
            .to.equal('')
          done()
        })
    })

    it('put', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'put', process.cwd() + '/test/test-data/node.json'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          expect(stdout[0])
            .to.equal('added QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
          done()
        })
    })

    it('stat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'stat', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
            .to.equal('NumLinks: 1')
          expect(stdout[1])
            .to.equal('BlockSize: 60')
          expect(stdout[2])
            .to.equal('LinksSize: 53')
          expect(stdout[3])
            .to.equal('DataSize: 7')
          done()
        })
    })

    it('data', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'data', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('another')
          done()
        })
    })

    it('links', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'links', 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V 8 some link')
          done()
        })
    })

    describe('patch', () => {
      it('append-data', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'append-data', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', process.cwd() + '/test/test-data/badconfig'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')
            done()
          })
      })

      it('set-data', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'set-data', 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6', process.cwd() + '/test/test-data/badconfig'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')
            done()
          })
      })

      it('add-link', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'add-link', 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', 'foo', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')
            done()
          })
      })

      it('rm-link', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'object', 'patch', 'rm-link', 'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK', 'foo'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(stdout[0])
              .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            done()
          })
      })
    })
  })
})
