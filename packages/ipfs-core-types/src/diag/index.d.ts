import type { AbortOptions } from '../utils'

export interface API<OptionExtension = {}> {
  cmds: (options?: AbortOptions & OptionExtension) => Promise<CmdsResult[]>
  net: (options?: AbortOptions & OptionExtension) => Promise<any>
  sys: (options?: AbortOptions & OptionExtension) => Promise<any>
}

export interface CmdsResult {
  active: boolean
  args: string[]
  endTime: Date
  id: string
  options: Record<string, any>
  startTime: Date
}
