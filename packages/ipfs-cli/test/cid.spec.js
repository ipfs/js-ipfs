/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { base32 } from 'multiformats/bases/base32'
import { base58btc } from 'multiformats/bases/base58'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagPB from '@ipld/dag-pb'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('cid', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      bases: {
        listBases: sinon.stub(),
        getBase: sinon.stub()
      },
      codecs: {
        listCodecs: sinon.stub(),
        getCodec: sinon.stub()
      },
      hashers: {
        listHashers: sinon.stub(),
        getHasher: sinon.stub()
      }
    }
  })

  describe('base32', () => {
    it('should convert a cid to base32', async () => {
      const out = await cli('cid base32 QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354')
    })

    it('should convert a cid to base32 from stdin', async () => {
      const out = await cli('cid base32', {
        ipfs,
        getStdin: function * () {
          yield uint8ArrayFromString('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn\n')
        }
      })
      expect(out.trim()).to.equal('bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354')
    })
  })

  describe('bases', () => {
    it('should list bases', async () => {
      ipfs.bases.listBases.returns([base32])

      const out = await cli('cid bases', { ipfs })
      expect(out.trim()).to.equal('base32')
    })

    it('should list bases with prefixes', async () => {
      ipfs.bases.listBases.returns([base32])

      const out = await cli('cid bases --prefix', { ipfs })
      expect(out.trim()).to.equal('b\tbase32')
    })

    it('should list bases with numeric code', async () => {
      ipfs.bases.listBases.returns([base32])

      const out = await cli('cid bases --numeric', { ipfs })
      expect(out.trim()).to.equal('98\tbase32')
    })

    it('should list bases with numeric code and prefix', async () => {
      ipfs.bases.listBases.returns([base32])

      const out = await cli('cid bases --numeric --prefix', { ipfs })
      expect(out.trim()).to.equal('b\t98\tbase32')
    })
  })

  describe('codecs', () => {
    it('should list codecs', async () => {
      ipfs.codecs.listCodecs.returns([raw])

      const out = await cli('cid codecs', { ipfs })
      expect(out.trim()).to.equal('raw')
    })

    it('should list codecs with numeric code', async () => {
      ipfs.codecs.listCodecs.returns([raw])

      const out = await cli('cid codecs --numeric', { ipfs })
      expect(out.trim()).to.equal('85\traw')
    })
  })

  describe('format', () => {
    it('should format cid', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('should format base name', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%b" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('base58btc')
    })

    it('should format base prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%B" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('z')
    })

    it('should format version string', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%v" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('cidv0')
    })

    it('should format version number', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%V" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('0')
    })

    it('should format codec name', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([dagPB])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%c" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('dag-pb')
    })

    it('should format codec code', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%C" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('112')
    })

    it('should format multihash name', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%h" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('sha2-256')
    })

    it('should format multihash name', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%H" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('18')
    })

    it('should format multihash digest length', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%L" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('32')
    })

    it('should format multihash encoded in default base', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%m" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('zQmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('should format multihash encoded in base %b', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%m" -b base32 QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('bciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y')
    })

    // go-ipfs always converts to v1?
    it.skip('should format multihash encoded in default base without multihash prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%M" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('bciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y')
    })

    it('should format multihash encoded in base %b without multihash prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%M" -b base32 QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('ciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y')
    })

    it('should format hash digest encoded in base %b with multihash prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%d" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('z72gdmFAgRzYHkJzKiL8MgMMRW3BTSCGyDHroPxJbxMJn')
    })

    it('should format hash digest encoded in base %b without multihash prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%D" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('72gdmFAgRzYHkJzKiL8MgMMRW3BTSCGyDHroPxJbxMJn')
    })

    it('should format cid in default base', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%s" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('should format cid in specified base', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%s" -b base32 QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('bciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y')
    })

    it('should format cid in default base without multibase prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%S" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('should format cid in specified base without multibase prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([raw])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%S" -b base32 QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('ciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y')
    })

    it('should format cid prefix', async () => {
      ipfs.bases.listBases.returns([base32, base58btc])
      ipfs.codecs.listCodecs.returns([dagPB])
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid format -f "%P" QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', { ipfs })
      expect(out.trim()).to.equal('cidv0-dag-pb-sha2-256-32')
    })
  })

  describe('hashes', () => {
    it('should list hashers', async () => {
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid hashes', { ipfs })
      expect(out.trim()).to.equal('sha2-256')
    })

    it('should list hashers with numeric code', async () => {
      ipfs.hashers.listHashers.returns([sha256])

      const out = await cli('cid hashes --numeric', { ipfs })
      expect(out.trim()).to.equal('18\tsha2-256')
    })
  })
})
