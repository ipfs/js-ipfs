/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const path = require('path')
const fs = require('fs')
const clean = require('../utils/clean')
const hat = require('hat')
const ipfsExec = require('../utils/ipfs-exec')
const os = require('os')
const tempWrite = require('temp-write')

describe('init', function () {
  this.timeout(100 * 1000)

  let repoPath
  let ipfs

  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
    .toString('utf-8')

  const repoExistsSync = (p) => fs.existsSync(path.join(repoPath, p))

  const repoDirSync = (p) => {
    return fs.readdirSync(path.join(repoPath, p)).filter((f) => {
      return !f.startsWith('.')
    })
  }

  const repoConfSync = (p) => {
    return JSON.parse(fs.readFileSync(path.join(repoPath, 'config')))
  }

  beforeEach(() => {
    repoPath = os.tmpdir() + '/ipfs-' + hat()
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('basic', async function () {
    const out = await ipfs('init')
    expect(repoDirSync('blocks')).to.have.length.above(2)
    expect(repoExistsSync('config')).to.equal(true)
    expect(repoExistsSync('version')).to.equal(true)

    // Test that the following was written when init-ing the repo
    // jsipfs cat /ipfs/QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr/readme
    const command = out.substring(out.indexOf('cat'), out.length - 2 /* omit the newline char */)
    const out2 = await ipfs(command)
    expect(out2).to.equal(readme)
  })

  it('profile', async function () {
    this.timeout(40 * 1000)

    await ipfs('init --profile lowpower')
    expect(repoConfSync().Swarm.ConnMgr.LowWater).to.equal(20)
  })

  it('profile non-existent', async function () {
    this.timeout(40 * 1000)

    await expect(ipfs('init --profile doesnt-exist'))
      .to.eventually.be.rejected()
      .and.to.have.property('stdout').that.includes('Could not find profile')
  })

  it('default config argument', async () => {
    const configPath = tempWrite.sync('{"Addresses": {"API": "/ip4/127.0.0.1/tcp/9999"}}', 'config.json')
    await ipfs(`init ${configPath}`)
    const configRaw = fs.readFileSync(path.join(repoPath, 'config')).toString()
    const config = JSON.parse(configRaw)
    expect(config.Addresses.API).to.be.eq('/ip4/127.0.0.1/tcp/9999')
  })

  // TODO test error for the config arg
})
