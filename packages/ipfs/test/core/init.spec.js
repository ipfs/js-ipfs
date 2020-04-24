/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { isNode } = require('ipfs-utils/src/env')
const { Buffer } = require('buffer')
const { nanoid } = require('nanoid')
const IPFS = require('../../src/core')

const privateKey = 'CAASqAkwggSkAgEAAoIBAQChVmiObYo6pkKrMSd3OzW1cTL+RDmX1rkETYGKWV9TPXMNgElFTYoYHqT9QZomj5RI8iUmHccjzqr4J0mV+E0NpvHHOLlmDZ82lAw2Zx7saUkeQWvC0S9Z0o3aTx2sSubZV53rSomkZgQH4fYTs4RERejV4ltzLFdzQQBwWrBvlagpPHUCxKDUCnE5oIzdbD26ltWViPBWr7TfotzC8Lyi/tceqCpHMUJGMbsVgypnlgpey07MBvs71dVh5LcRen/ztsQO6Yju4D3QgWoyD0SIUdJFvBzEwL9bSiA3QjUc/fkGd7EcdN5bebYOqAi4ZIiAMLp3i4+B8Tzq/acull43AgMBAAECggEBAIDgZE75o4SsEO9tKWht7L5OeXxxBUyMImkUfJkGQUZd/MzZIC5y/Q+9UvBW+gs5gCsw+onTGaM50Iq/32Ej4nE4XURVxIuH8BmJ86N1hlc010qK2cjajqeCsPulXT+m6XbOLYCpnv+q2idt0cL1EH/1FEPeOEztK8ION4qIdw36SoykfTx/RqtkKHtS01AwN82EOPbWk7huyQT5R5MsCZmRJXBFkpNtiL+8619BH2aVlghHO4NouF9wQjdz/ysVuyYg+3rX2cpGjuHDTZ6hVQiJD1lF6D+dua7UPyHYAG2iRQiKZmCjitt9ywzPxiRaYF/aZ02FEMWckZulR09axskCgYEAzjl6ER8WwxYHn4tHse+CrIIF2z5cscdrh7KSwd3Rse9hIIBDJ/0KkvoYd1IcWrS8ywLrRfSLIjEU9u7IN1m+IRVWJ61fXNqOHm9clAu6qNhCN6W2+JfxDkUygTwmsq0v3huO+qkiMQz+a4nAXJe8Utd36ywgPhVGxFa/7x1v1N0CgYEAyEdiYRFf1aQZcO7+B2FH+tkGJsB30VIBhcpG9EukuQUUulLHhScc/KRj+EFAACLdkTqlVI0xVYIWaaCXwoQCWKixjZ5mYPC+bBLgn4IoDS6XTdHtR7Vn3UUvGTKsM0/z4e8/0eSzGNCHoYez9IoBlPNic0sQuST4jzgS2RYnFCMCgYASWSzSLyjwTJp7CIJlg4Dl5l+tBRxsOOkJVssV8q2AnmLO6HqRKUNylkvs+eJJ88DEc0sJm1txvFo4KkCoJBT1jpduyk8szMlOTew3w99kvHEP0G+6KJKrCV8X/okW5q/WnC8ZgEjpglV0rfnugxWfbUpfIzrvKydzuqAzHzRfBQKBgQDANtKSeoxRjEbmfljLWHAure8bbgkQmfXgI7xpZdfXwqqcECpw/pLxXgycDHOSLeQcJ/7Y4RGCEXHVOk2sX+mokW6mjmmPjD4VlyCBtfcef6KzC1EBS3c9g9KqCln+fTOBmY7UsPu6SxiAzK7HeVP/Un8gS+Dm8DalrZlZQ8uJpQKBgF6mL/Xo/XUOiz2jAD18l8Y6s49bA9H2CoLpBGTV1LfY5yTFxRy4R3qnX/IzsKy567sbtkEFKJxplc/RzCQfrgbdj7k26SbKtHR3yERaFGRYq8UeAHeYC1/N19LF5BMQL4y5R4PJ1SFPeJCL/wXiMqs1maTqvKqtc4bbegNdwlxn'

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('init', function () {
  if (!isNode) return

  let ipfs
  let repo

  beforeEach(async () => {
    repo = createTempRepo()

    ipfs = await IPFS.create({
      repo,
      init: false,
      start: false,
      preload: { enabled: false }
    })
  })

  afterEach(() => repo.teardown())

  it('should init successfully', async () => {
    await ipfs.init({ bits: 512, pass: nanoid() })

    const res = await repo.exists()
    expect(res).to.equal(true)

    const config = await repo.config.get()

    expect(config.Identity).to.exist()
    expect(config.Keychain).to.exist()
  })

  it('should set # of bits in key', async function () {
    this.timeout(40 * 1000)

    await ipfs.init({ bits: 1024, pass: nanoid() })

    const config = await repo.config.get()
    expect(config.Identity.PrivKey.length).is.above(256)
  })

  it('should allow a pregenerated key to be used', async () => {
    await ipfs.init({ privateKey })

    const config = await repo.config.get()
    expect(config.Identity.PeerID).is.equal('QmRsooYQasV5f5r834NSpdUtmejdQcpxXkK6qsozZWEihC')
  })

  it('should write init docs', async () => {
    await ipfs.init({ bits: 512, pass: nanoid() })
    const multihash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

    const node = await ipfs.object.get(multihash, { enc: 'base58' })
    expect(node.Links).to.exist()
  })

  it('should allow init with an empty repo', async () => {
    await ipfs.init({ bits: 512, emptyRepo: true })

    // Should not have default assets
    const multihash = Buffer.from('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')
    await expect(ipfs.object.get(multihash, {})).to.eventually.be.rejected()
  })

  it('should apply one profile', async () => {
    await ipfs.init({ bits: 512, profiles: ['test'] })

    const config = await repo.config.get()
    expect(config.Bootstrap).to.be.empty()
  })

  it('should apply multiple profiles', async () => {
    await ipfs.init({ bits: 512, profiles: ['test', 'local-discovery'] })

    const config = await repo.config.get()
    expect(config.Bootstrap).to.be.empty()
    expect(config.Discovery.MDNS.Enabled).to.be.true()
  })
})
