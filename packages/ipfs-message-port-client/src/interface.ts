// This file contains some utility types that either can't be expressed in
// JSDoc syntax or that result in a different behaviour when typed in JSDoc.

/**
 * Utility type that takes IPFS Core API function type (with 0 to 4 arguments
 * & last **optional** `options` parameter) and derives a function type with
 * `options` parameter extended with given `Extra` options.
 *
 * **Caution**: API Functions with more than for arguments ahead of `options`
 * will result to `never` type. API function that does not take `options` will
 * result in function whose last argument is extended with `Extra` which would
 * be an error.
 */
// This is typed in TS file because otherwise TS unifies on the first parameter
// regardless of number of parameters function has.
export type APIWithExtraOptions<API extends (...args: any[]) => any, Extra> =
  (...args: WithExtendedOptions<Parameters<API>, Extra>) => ReturnType<API>

type End = never[]
type WithExtendedOptions<Params, Ext> = Params extends [...End]
  ? []
  // (options?: Options) -> (options?: Options & Ext)
  : Params extends [options?: infer Options, ...end: End]
  ? [options?: Options & Ext]
  // (a: A1, options?: Options) -> (a1: A1, options?: Options & Ext)
  : Params extends [a1: infer A1, options?: infer Options, ...end: End]
  ? [a1: A1, options?: Options & Ext]
  // (a1?: A1, options?: Options) -> (a1?: A1, options?: Options & Ext)
  : Params extends [a1?: infer A1, options?: infer Options, ...end: End]
  ? [a1?: A1, options?: Options & Ext]
  // (a1: A1, a2: A2, options?: Options) -> (a1: A1, a2: A2 options?: Options & Ext)
  : Params extends [a1: infer A1, a2: infer A2, options?: infer Options, ...end: End]
  ? [a1: A1, a2: A2, options?: Options & Ext]
  // (a1: A1, a2?: A2, options?: Options) -> (a1: A1, a2?: A2 options?: Options & Ext)
  : Params extends [a1: infer A1, a2?: infer A2, options?: infer Options, ...end: End]
  ? [a1: A1, a2?: A2, options?: Options & Ext]
  // (a1: A1, a2?: A2, options?: Options) -> (a1: A1, a2?: A2 options?: Options & Ext)
  : Params extends [a1?: infer A1, a2?: infer A2, options?: infer Options, ...end: End]
  ? [a1?: A1, a2?: A2, options?: Options & Ext]
  // (a1: A1, a2: A2, a3:A3 options?: Options) -> (a1: A1, a2: A2, a3:A3, options?: Options & Ext)
  : Params extends [a1: infer A1, a2: infer A2, a3:infer A3, options?: infer Options, ...end: End]
  ? [a1: A1, a2: A2, a3: A3, options?: Options & Ext]
  // (a1: A1, a2: A2, a3?:A3 options?: Options) -> (a1: A1, a2: A2, a3?:A3, options?: Options & Ext)
  : Params extends [a1: infer A1, a2:infer A2, a3?: infer A3, options?: infer Options, ...end: End]
  ? [a1: A1, a2: A2, a3?: A3, options?: Options & Ext]
  // (a1: A1, a2?: A2, a3?:A3 options?: Options) -> (a1: A1, a2?: A2, a3?:A3, options?: Options & Ext)
  : Params extends [a1: infer A1, a2?: infer A2, a3?: infer A3, options?: infer Options, ...end: End]
  ? [a1: A1, a2?: A2, a3?: A3, options?: Options & Ext]
  // (a1?: A1, a2?: A2, a3?:A3 options?: Options) -> (a1?: A1, a2?: A2, a3?:A3, options?: Options & Ext)
  : Params extends [a1?: infer A1, a2?: infer A2, a3?: infer A3, options?: infer Options, ...end: End]
  ? [a1?: A1, a2?: A2, a3?: A3, options?: Options & Ext]
  : never

export type APIMethodWithExtraOptions <
  API,
  Key extends keyof API,
  Extra
  > = API[Key] extends (...args: any[]) => any ? APIWithExtraOptions<API[Key], Extra> : never
