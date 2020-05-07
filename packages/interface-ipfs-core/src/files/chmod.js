/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const isShardAtPath = require('../utils/is-shard-at-path')

module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.chmod', function () {
    this.timeout(40 * 1000)

    let ipfs

    async function testChmod (initialMode, modification, expectedFinalMode) {
      const path = `/test-${nanoid()}`

      await ipfs.files.write(path, Buffer.from('Hello world!'), {
        create: true,
        mtime: new Date(),
        mode: initialMode
      })
      await ipfs.files.chmod(path, modification, {
        flush: true
      })

      const updatedMode = (await ipfs.files.stat(path)).mode
      expect(updatedMode).to.equal(parseInt(expectedFinalMode, 8))
    }

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should update the mode for a file', async () => {
      const path = `/foo-${Math.random()}`

      await ipfs.files.write(path, Buffer.from('Hello world'), {
        create: true,
        mtime: new Date()
      })
      const originalMode = (await ipfs.files.stat(path)).mode
      await ipfs.files.chmod(path, '0777', {
        flush: true
      })

      const updatedMode = (await ipfs.files.stat(path)).mode
      expect(updatedMode).to.not.equal(originalMode)
      expect(updatedMode).to.equal(parseInt('0777', 8))
    })

    it('should update the mode for a directory', async () => {
      const path = `/foo-${Math.random()}`

      await ipfs.files.mkdir(path)
      const originalMode = (await ipfs.files.stat(path)).mode
      await ipfs.files.chmod(path, '0777', {
        flush: true
      })

      const updatedMode = (await ipfs.files.stat(path)).mode
      expect(updatedMode).to.not.equal(originalMode)
      expect(updatedMode).to.equal(parseInt('0777', 8))
    })

    it('should update the mode for a hamt-sharded-directory', async () => {
      const path = `/foo-${Math.random()}`

      await ipfs.files.mkdir(path)
      await ipfs.files.write(`${path}/foo.txt`, Buffer.from('Hello world'), {
        create: true,
        shardSplitThreshold: 0
      })
      const originalMode = (await ipfs.files.stat(path)).mode
      await ipfs.files.chmod(path, '0777', {
        flush: true
      })

      const updatedMode = (await ipfs.files.stat(path)).mode
      expect(updatedMode).to.not.equal(originalMode)
      expect(updatedMode).to.equal(parseInt('0777', 8))
    })

    it('should update modes with basic symbolic notation that adds bits', async () => {
      await testChmod('0000', '+x', '0111')
      await testChmod('0000', '+w', '0222')
      await testChmod('0000', '+r', '0444')
      await testChmod('0000', 'u+x', '0100')
      await testChmod('0000', 'u+w', '0200')
      await testChmod('0000', 'u+r', '0400')
      await testChmod('0000', 'g+x', '0010')
      await testChmod('0000', 'g+w', '0020')
      await testChmod('0000', 'g+r', '0040')
      await testChmod('0000', 'o+x', '0001')
      await testChmod('0000', 'o+w', '0002')
      await testChmod('0000', 'o+r', '0004')
      await testChmod('0000', 'ug+x', '0110')
      await testChmod('0000', 'ug+w', '0220')
      await testChmod('0000', 'ug+r', '0440')
      await testChmod('0000', 'ugo+x', '0111')
      await testChmod('0000', 'ugo+w', '0222')
      await testChmod('0000', 'ugo+r', '0444')
      await testChmod('0000', 'a+x', '0111')
      await testChmod('0000', 'a+w', '0222')
      await testChmod('0000', 'a+r', '0444')
    })

    it('should update modes with basic symbolic notation that removes bits', async () => {
      await testChmod('0111', '-x', '0000')
      await testChmod('0222', '-w', '0000')
      await testChmod('0444', '-r', '0000')
      await testChmod('0100', 'u-x', '0000')
      await testChmod('0200', 'u-w', '0000')
      await testChmod('0400', 'u-r', '0000')
      await testChmod('0010', 'g-x', '0000')
      await testChmod('0020', 'g-w', '0000')
      await testChmod('0040', 'g-r', '0000')
      await testChmod('0001', 'o-x', '0000')
      await testChmod('0002', 'o-w', '0000')
      await testChmod('0004', 'o-r', '0000')
      await testChmod('0110', 'ug-x', '0000')
      await testChmod('0220', 'ug-w', '0000')
      await testChmod('0440', 'ug-r', '0000')
      await testChmod('0111', 'ugo-x', '0000')
      await testChmod('0222', 'ugo-w', '0000')
      await testChmod('0444', 'ugo-r', '0000')
      await testChmod('0111', 'a-x', '0000')
      await testChmod('0222', 'a-w', '0000')
      await testChmod('0444', 'a-r', '0000')
    })

    it('should update modes with basic symbolic notation that overrides bits', async () => {
      await testChmod('0777', '=x', '0111')
      await testChmod('0777', '=w', '0222')
      await testChmod('0777', '=r', '0444')
      await testChmod('0777', 'u=x', '0177')
      await testChmod('0777', 'u=w', '0277')
      await testChmod('0777', 'u=r', '0477')
      await testChmod('0777', 'g=x', '0717')
      await testChmod('0777', 'g=w', '0727')
      await testChmod('0777', 'g=r', '0747')
      await testChmod('0777', 'o=x', '0771')
      await testChmod('0777', 'o=w', '0772')
      await testChmod('0777', 'o=r', '0774')
      await testChmod('0777', 'ug=x', '0117')
      await testChmod('0777', 'ug=w', '0227')
      await testChmod('0777', 'ug=r', '0447')
      await testChmod('0777', 'ugo=x', '0111')
      await testChmod('0777', 'ugo=w', '0222')
      await testChmod('0777', 'ugo=r', '0444')
      await testChmod('0777', 'a=x', '0111')
      await testChmod('0777', 'a=w', '0222')
      await testChmod('0777', 'a=r', '0444')
    })

    it('should update modes with multiple symbolic notation', async () => {
      await testChmod('0000', 'g+x,u+w', '0210')
    })

    it('should update modes with special symbolic notation', async () => {
      await testChmod('0000', 'g+s', '2000')
      await testChmod('0000', 'u+s', '4000')
      await testChmod('0000', '+t', '1000')
      await testChmod('0000', '+s', '6000')
    })

    it('should apply special execute permissions to world', async () => {
      const path = `/foo-${Math.random()}`
      const sub = `${path}/sub`
      const file = `${path}/sub/foo.txt`
      const bin = `${path}/sub/bar`

      await ipfs.files.mkdir(sub, {
        parents: true
      })
      await ipfs.files.touch(file)
      await ipfs.files.touch(bin)

      await ipfs.files.chmod(path, 0o644, {
        recursive: true
      })
      await ipfs.files.chmod(bin, 'u+x')

      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o744)

      await ipfs.files.chmod(path, 'a+X', {
        recursive: true
      })

      // directories should be world-executable
      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o755)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o755)

      // files without prior execute bit should be untouched
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)

      // files with prior execute bit should now be world-executable
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o755)
    })

    it('should apply special execute permissions to user', async () => {
      const path = `/foo-${Math.random()}`
      const sub = `${path}/sub`
      const file = `${path}/sub/foo.txt`
      const bin = `${path}/sub/bar`

      await ipfs.files.mkdir(sub, {
        parents: true
      })
      await ipfs.files.touch(file)
      await ipfs.files.touch(bin)

      await ipfs.files.chmod(path, 0o644, {
        recursive: true
      })
      await ipfs.files.chmod(bin, 'u+x')

      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o744)

      await ipfs.files.chmod(path, 'u+X', {
        recursive: true
      })

      // directories should be user executable
      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o744)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o744)

      // files without prior execute bit should be untouched
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)

      // files with prior execute bit should now be user executable
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o744)
    })

    it('should apply special execute permissions to user and group', async () => {
      const path = `/foo-${Math.random()}`
      const sub = `${path}/sub`
      const file = `${path}/sub/foo.txt`
      const bin = `${path}/sub/bar`

      await ipfs.files.mkdir(sub, {
        parents: true
      })
      await ipfs.files.touch(file)
      await ipfs.files.touch(bin)

      await ipfs.files.chmod(path, 0o644, {
        recursive: true
      })
      await ipfs.files.chmod(bin, 'u+x')

      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o744)

      await ipfs.files.chmod(path, 'ug+X', {
        recursive: true
      })

      // directories should be user and group executable
      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o754)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o754)

      // files without prior execute bit should be untouched
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)

      // files with prior execute bit should now be user and group executable
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o754)
    })

    it('should apply special execute permissions to sharded directories', async () => {
      const path = `/foo-${Math.random()}`
      const sub = `${path}/sub`
      const file = `${path}/sub/foo.txt`
      const bin = `${path}/sub/bar`

      await ipfs.files.mkdir(sub, {
        parents: true,
        shardSplitThreshold: 0
      })
      await ipfs.files.touch(file, {
        shardSplitThreshold: 0
      })
      await ipfs.files.touch(bin, {
        shardSplitThreshold: 0
      })

      await ipfs.files.chmod(path, 0o644, {
        recursive: true,
        shardSplitThreshold: 0
      })
      await ipfs.files.chmod(bin, 'u+x', {
        recursive: true,
        shardSplitThreshold: 0
      })

      await expect(ipfs.files.stat(path)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o744)

      await ipfs.files.chmod(path, 'ug+X', {
        recursive: true,
        shardSplitThreshold: 0
      })

      // directories should be user and group executable
      await expect(isShardAtPath(path, ipfs)).to.eventually.be.true()
      await expect(ipfs.files.stat(path)).to.eventually.include({
        type: 'directory',
        mode: 0o754
      })
      await expect(ipfs.files.stat(sub)).to.eventually.have.property('mode', 0o754)

      // files without prior execute bit should be untouched
      await expect(ipfs.files.stat(file)).to.eventually.have.property('mode', 0o644)

      // files with prior execute bit should now be user and group executable
      await expect(ipfs.files.stat(bin)).to.eventually.have.property('mode', 0o754)
    })
  })
}
