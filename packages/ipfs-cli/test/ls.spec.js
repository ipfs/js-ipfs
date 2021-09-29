/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'

const defaultOptions = {
  timeout: undefined
}

describe('ls', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      ls: sinon.stub(),
      bases: {
        getBase: sinon.stub()
      }
    }

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: CID.parse('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks'
    }, {
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928
    }])

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      mode: 0o755,
      mtime: null,
      cid: CID.parse('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks'
    }, {
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928
    }])

    ipfs.ls.withArgs('/ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: CID.parse('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks'
    }, {
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928
    }])

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/blocks', defaultOptions).returns([{
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD'),
      type: 'file',
      name: 'CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data',
      size: 10849
    }, {
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx'),
      type: 'file',
      name: 'CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data',
      size: 10807
    }])

    ipfs.ls.withArgs('bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: CID.parse('bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq'),
      type: 'dir',
      name: 'blocks',
      depth: 0
    }])
  })

  it('prints added files', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('prints added files with /ipfs/ prefix', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports a trailing slash', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports multiple trailing slashes', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports multiple intermediate slashes', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///blocks', { ipfs })
    expect(out).to.eql(
      '-rw-r--r-- - QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD 10849 CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data\n' +
      '-rw-r--r-- - QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx 10807 CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data\n'
    )
  })

  it('adds a header, -v', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z -v', { ipfs })
    expect(out).to.eql(
      'Mode       Mtime Hash                                           Size Name\n' +
      'drwxr-xr-x -     QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT -    blocks/\n' +
      '-rw-r--r-- -     QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('should ls and print CIDs encoded in specified base', async () => {
    ipfs.bases.getBase.withArgs('base64').returns(base64)

    const out = await cli('ls bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq --cid-base=base64', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - mAXESIFgkdj3wVJjyuQSabCncE9phJUPZQmr1h47PEKMiCKxM - blocks/\n'
    )
  })

  it('prints added files with a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z --timeout=1s', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('removes control characters from paths', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: CID.parse('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'bl\nock\bs',
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: CID.parse('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'co\r\tnfig',
      size: 3928,
      depth: 0
    }])

    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })
})
