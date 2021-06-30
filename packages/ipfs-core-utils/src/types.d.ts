import { MultibaseCodec } from 'multiformats/bases/interface'
import { BlockCodec } from 'multiformats/codecs/interface'
import { MultihashHasher } from 'multiformats/hashes/interface'

export type LoadBaseFn = (codeOrName: string) => Promise<MultibaseCodec<any>>
export type LoadCodecFn = (codeOrName: number | string) => Promise<BlockCodec<any, any>>
export type LoadHasherFn = (codeOrName: number | string) => Promise<MultihashHasher>
