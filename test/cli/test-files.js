/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const fs = require('fs')
const path = require('path')
const describeOnlineAndOffline = require('../utils/on-and-off')
const ipfs = require('../utils/ipfs')(repoPath)

describe('files', () => {
  describeOnlineAndOffline(repoPath, () => {
    it('cat', () => {
      return ipfs('files cat QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql('hello world')
      })
    })

    it('get', () => {
      return ipfs('files get QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql(
          'Saving file(s) to QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        )

        const file = path.join(process.cwd(), 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
        expect(
          fs.readFileSync(file).toString()
        ).to.be.eql(
          'hello world\n'
        )

        fs.unlinkSync(file)
      })
    })

    it('add', () => {
      return ipfs('files add src/init-files/init-docs/readme').then((out) => {
        expect(out).to.be.eql(
          'added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme'
        )
      })
    })

    it('add recursively', () => {
      return ipfs('files add -r src/init-files/init-docs').then((out) => {
        expect(out).to.be.eql([
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
        ].join('\n'))
      })
    })
  })
})
