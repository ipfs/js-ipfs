/* eslint-env mocha */

import { Multicodecs } from 'ipfs-core-utils/multicodecs'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as raw from 'multiformats/codecs/raw'

export const codecs = new Multicodecs({
  codecs: [dagPB, dagCBOR, raw],
  loadCodec: () => Promise.reject(new Error('No extra codecs configured'))
})
