/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('files', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('cat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'cat', 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('hello world')
          done()
        })
    })

    it('add', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', 'src/init-files/init-docs/readme'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme')
          done()
        })
    })

    it('add recursively', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', '-r', 'src/init-files/init-docs'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          const expected = [
            'added QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs init-docs/tour/0.0-intro',
            'added QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te init-docs/tour',
            'added QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ init-docs/security-notes',
            'added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB init-docs/readme',
            'added QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha init-docs/quick-start',
            'added QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 init-docs/help',
            'added QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT init-docs/docs/index',
            'added QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC init-docs/docs',
            'added QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y init-docs/contact',
            'added QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V init-docs/about',
            'added QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU init-docs'
          ]
          expect(stdout).to.deep.equal(expected)
          done()
        })
    })
  })

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

    it('cat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'cat', 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('hello world')
          done()
        })
    })

    it('add', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', 'src/init-files/init-docs/readme'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme')
          done()
        })
    })

    it('add recursively', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', '-r', 'src/init-files/init-docs'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          const expected = [
            'added QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs init-docs/tour/0.0-intro',
            'added QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te init-docs/tour',
            'added QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ init-docs/security-notes',
            'added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB init-docs/readme',
            'added QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha init-docs/quick-start',
            'added QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 init-docs/help',
            'added QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT init-docs/docs/index',
            'added QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC init-docs/docs',
            'added QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y init-docs/contact',
            'added QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V init-docs/about',
            'added QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU init-docs'
          ]
          expect(stdout).to.deep.equal(expected)
          done()
        })
    })
  })
})
