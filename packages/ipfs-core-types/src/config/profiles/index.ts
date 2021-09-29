import type { AbortOptions } from '../../utils'
import type { Config } from '../'

export interface API<OptionExtension = {}> {
  /**
   * List available config profiles
   */
  list: (options?: AbortOptions & OptionExtension) => Promise<Profile[]>

  /**
   * Apply a profile to the current config.  Note that restarting the node
   * will be necessary for any change to take effect.
   */
  apply: (name: string, options?: ProfilesApplyOptions & OptionExtension) => Promise<ProfilesApplyResult>
}

export interface Profile {
  name: string
  description: string
}

export interface ProfilesApplyOptions extends AbortOptions {
  dryRun?: boolean
}
export interface ProfilesApplyResult {
  original: Config
  updated: Config
}
