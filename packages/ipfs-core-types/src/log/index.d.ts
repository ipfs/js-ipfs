import type { AbortOptions } from '../utils'

export interface API<OptionExtension = {}> {
  level: (subsystem: string, level: string, options?: AbortOptions & OptionExtension) => Promise<any>
  ls: (options?: AbortOptions & OptionExtension) => Promise<any>
  tail: (options?: AbortOptions & OptionExtension) => AsyncIterable<any>
}
