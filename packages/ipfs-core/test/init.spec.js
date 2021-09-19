/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { isNode } from 'ipfs-utils/src/env.js'
import { CID } from 'multiformats/cid'
import PeerId from 'peer-id'
import { keys } from 'libp2p-crypto'
import createNode from './utils/create-node.js'

const { supportedKeys } = keys

const privateKey = 'CAASqAkwggSkAgEAAoIBAQChVmiObYo6pkKrMSd3OzW1cTL+RDmX1rkETYGKWV9TPXMNgElFTYoYHqT9QZomj5RI8iUmHccjzqr4J0mV+E0NpvHHOLlmDZ82lAw2Zx7saUkeQWvC0S9Z0o3aTx2sSubZV53rSomkZgQH4fYTs4RERejV4ltzLFdzQQBwWrBvlagpPHUCxKDUCnE5oIzdbD26ltWViPBWr7TfotzC8Lyi/tceqCpHMUJGMbsVgypnlgpey07MBvs71dVh5LcRen/ztsQO6Yju4D3QgWoyD0SIUdJFvBzEwL9bSiA3QjUc/fkGd7EcdN5bebYOqAi4ZIiAMLp3i4+B8Tzq/acull43AgMBAAECggEBAIDgZE75o4SsEO9tKWht7L5OeXxxBUyMImkUfJkGQUZd/MzZIC5y/Q+9UvBW+gs5gCsw+onTGaM50Iq/32Ej4nE4XURVxIuH8BmJ86N1hlc010qK2cjajqeCsPulXT+m6XbOLYCpnv+q2idt0cL1EH/1FEPeOEztK8ION4qIdw36SoykfTx/RqtkKHtS01AwN82EOPbWk7huyQT5R5MsCZmRJXBFkpNtiL+8619BH2aVlghHO4NouF9wQjdz/ysVuyYg+3rX2cpGjuHDTZ6hVQiJD1lF6D+dua7UPyHYAG2iRQiKZmCjitt9ywzPxiRaYF/aZ02FEMWckZulR09axskCgYEAzjl6ER8WwxYHn4tHse+CrIIF2z5cscdrh7KSwd3Rse9hIIBDJ/0KkvoYd1IcWrS8ywLrRfSLIjEU9u7IN1m+IRVWJ61fXNqOHm9clAu6qNhCN6W2+JfxDkUygTwmsq0v3huO+qkiMQz+a4nAXJe8Utd36ywgPhVGxFa/7x1v1N0CgYEAyEdiYRFf1aQZcO7+B2FH+tkGJsB30VIBhcpG9EukuQUUulLHhScc/KRj+EFAACLdkTqlVI0xVYIWaaCXwoQCWKixjZ5mYPC+bBLgn4IoDS6XTdHtR7Vn3UUvGTKsM0/z4e8/0eSzGNCHoYez9IoBlPNic0sQuST4jzgS2RYnFCMCgYASWSzSLyjwTJp7CIJlg4Dl5l+tBRxsOOkJVssV8q2AnmLO6HqRKUNylkvs+eJJ88DEc0sJm1txvFo4KkCoJBT1jpduyk8szMlOTew3w99kvHEP0G+6KJKrCV8X/okW5q/WnC8ZgEjpglV0rfnugxWfbUpfIzrvKydzuqAzHzRfBQKBgQDANtKSeoxRjEbmfljLWHAure8bbgkQmfXgI7xpZdfXwqqcECpw/pLxXgycDHOSLeQcJ/7Y4RGCEXHVOk2sX+mokW6mjmmPjD4VlyCBtfcef6KzC1EBS3c9g9KqCln+fTOBmY7UsPu6SxiAzK7HeVP/Un8gS+Dm8DalrZlZQ8uJpQKBgF6mL/Xo/XUOiz2jAD18l8Y6s49bA9H2CoLpBGTV1LfY5yTFxRy4R3qnX/IzsKy567sbtkEFKJxplc/RzCQfrgbdj7k26SbKtHR3yERaFGRYq8UeAHeYC1/N19LF5BMQL4y5R4PJ1SFPeJCL/wXiMqs1maTqvKqtc4bbegNdwlxn'
const edPrivateKey = 'CAESYFeZamw+9QdwHgSmcvPmfLUpmWTtYpUeycbXcfnkTnDI7OaPmE6V8i+Lw7FNB5CtYuDFKUsOS5h+AogyF/Dft4Ds5o+YTpXyL4vDsU0HkK1i4MUpSw5LmH4CiDIX8N+3gA=='
const secpPrivateKey = 'CAISIKCfwZsMEwmzLxGv9duM6j6YQzMx2V46+Yl3laV24Qus'

describe('init', function () {
  if (!isNode) return

  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {import('ipfs-repo').IPFSRepo} */
  let repo
  /** @type {() => Promise<void>} */
  let cleanup

  /**
   * @param {import('../src/types').Options} [options]
   */
  const init = async (options) => {
    const res = await createNode({
      ...options,
      start: false
    })

    ipfs = res.ipfs
    repo = res.repo
    cleanup = res.cleanup

    return ipfs
  }
  afterEach(() => cleanup())

  it('should init successfully', async () => {
    await init()

    const res = await repo.exists()
    expect(res).to.equal(true)

    const config = await repo.config.getAll()

    expect(config).to.have.property('Identity')
    expect(config).to.have.nested.property('Keychain.DEK')
  })

  it('should init successfully with a keychain pass', async () => {
    await init({
      pass: 'super-super-secure-1234',
      init: {
        algorithm: 'RSA',
        bits: 512
      }
    })

    const res = await repo.exists()
    expect(res).to.equal(true)

    const config = await repo.config.getAll()
    expect(config.Keychain).to.exist()

    const { ipfs: ipfs2, repo: repo2 } = await createNode({
      repo: repo,
      pass: 'something-else-that-is-long-enough',
      start: false,
      init: {
        algorithm: 'RSA',
        bits: 512
      }
    })

    // same repo, same peer id
    expect(repo.path).to.equal(repo2.path)
    expect(await ipfs2.id()).to.deep.equal(await ipfs.id())

    // opened with correct password
    await expect(ipfs.key.export('self', 'some-other-password')).to.eventually.be.ok()

    // opened with incorrect password
    await expect(ipfs2.key.export('self', 'some-other-password')).to.eventually.be.rejected()
  })

  it('should init with a key algorithm (RSA)', async () => {
    await init({ init: { algorithm: 'RSA' } })

    const config = await repo.config.getAll()
    const peerId = await PeerId.createFromPrivKey(`${config.Identity?.PrivKey}`)
    expect(peerId.privKey).is.instanceOf(supportedKeys.rsa.RsaPrivateKey)
  })

  it('should init with a key algorithm (Ed25519)', async () => {
    await init({ init: { algorithm: 'Ed25519' } })

    const config = await repo.config.getAll()
    const peerId = await PeerId.createFromPrivKey(`${config.Identity?.PrivKey}`)
    expect(peerId.privKey).is.instanceOf(supportedKeys.ed25519.Ed25519PrivateKey)
  })

  it('should init with a key algorithm (secp256k1)', async () => {
    await init({ init: { algorithm: 'secp256k1' } })

    const config = await repo.config.getAll()
    const peerId = await PeerId.createFromPrivKey(`${config.Identity?.PrivKey}`)
    expect(peerId.privKey).is.instanceOf(supportedKeys.secp256k1.Secp256k1PrivateKey)
  })

  it('should set # of bits in key', async function () {
    this.timeout(120 * 1000)

    await init({
      init: {
        algorithm: 'RSA',
        bits: 1024
      }
    })

    const config = await repo.config.getAll()
    expect(config.Identity?.PrivKey.length).is.above(256)
  })

  it('should allow a pregenerated key to be used', async () => {
    await init({ init: { privateKey } })

    const config = await repo.config.getAll()
    expect(config.Identity?.PeerID).is.equal('QmRsooYQasV5f5r834NSpdUtmejdQcpxXkK6qsozZWEihC')
  })

  it('should allow a pregenerated ed25519 key to be used', async () => {
    await init({ init: { privateKey: edPrivateKey } })

    const config = await repo.config.getAll()
    expect(config.Identity?.PeerID).is.equal('12D3KooWRm8J3iL796zPFi2EtGGtUJn58AG67gcqzMFHZnnsTzqD')
  })

  it('should allow a pregenerated secp256k1 key to be used', async () => {
    await init({ init: { privateKey: secpPrivateKey } })

    const config = await repo.config.getAll()
    expect(config.Identity?.PeerID).is.equal('16Uiu2HAm5qw8UyXP2RLxQUx5KvtSN8DsTKz8quRGqGNC3SYiaB8E')
  })

  it('should write init docs', async () => {
    await init()
    const multihash = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    const node = await ipfs.object.get(multihash, { enc: 'base58' })
    expect(node.Links).to.exist()
  })

  it('should allow init with an empty repo', async () => {
    await init({ init: { emptyRepo: true } })

    // Should not have default assets
    const multihash = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    await expect(ipfs.object.get(multihash, {})).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
  })

  it('should apply one profile', async () => {
    await init({ init: { profiles: ['test'] } })

    const config = await repo.config.getAll()
    expect(config.Bootstrap).to.be.empty()
  })

  it('should apply multiple profiles', async () => {
    await init({ init: { profiles: ['test', 'local-discovery'] } })

    const config = await repo.config.getAll()
    expect(config.Bootstrap).to.be.empty()
    expect(config.Discovery?.MDNS?.Enabled).to.be.true()
  })
})
