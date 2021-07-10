import { MultibaseCodec } from 'multiformats/bases/interface'
import { BlockCodec } from 'multiformats/codecs/interface'
import { MultihashHasher } from 'multiformats/hashes/interface'

export interface LoadBaseFn { (codeOrName: string): Promise<MultibaseCodec<any>> }
export interface LoadCodecFn { (codeOrName: number | string): Promise<BlockCodec<any, any>> }
export interface LoadHasherFn { (codeOrName: number | string): Promise<MultihashHasher> }
