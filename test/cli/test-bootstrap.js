/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const _ = require('lodash')

describe('bootstrap', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = require('./index').repoPath

  describe('api offline', () => {
    const defaultList = [
      '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
      '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
      '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
      '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
      '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
      '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
      '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
      '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx'
    ]

    const updatedList = [
      '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
      '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
      '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
      '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
      '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
      '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
      '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
      '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
      '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
    ]

    it('list the bootstrap nodes', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bootstrap', 'list'], {env})
        .run((err, stdout, exitcode) => {
          expect(stdout).to.deep.equal(defaultList)
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('add another bootstrap node', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bootstrap', 'add', '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bootstrap', 'list'], {env})
            .run((err, stdout, exitcode) => {
              expect(stdout).to.deep.equal(updatedList)
              expect(err).to.not.exist
              expect(exitcode).to.equal(0)
              done()
            })
        })
    })

    it('rm a bootstrap node', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bootstrap', 'rm', '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'bootstrap', 'list'], {env})
            .run((err, stdout, exitcode) => {
              expect(stdout).to.deep.equal(defaultList)
              expect(err).to.not.exist
              expect(exitcode).to.equal(0)
              done()
            })
        })
    })
  })

  describe('api running', () => {})
})
