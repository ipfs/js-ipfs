export type Procedure<T> = T extends (arg: infer I) => infer O
  ? (query: I & QueryOptions) => Return<O>
  : undefined

export type Remote<T extends Record<string, unknown>> = {
  [K in keyof T]: Procedure<T[K]>
}

export type Return<T> = T extends Promise<infer U>
  ? Promise<U & TransferOptions>
  : Promise<T & TransferOptions>

export interface QueryOptions {
  signal?: AbortSignal
  timeout?: number
  transfer?: Set<Transferable>
}

export interface TransferOptions {
  transfer?: Set<Transferable>
}

export type NonUndefined<A> = A extends undefined ? never : A

export type ProcedureNames<T extends Record<string, unknown>> = Array<{
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never // eslint-disable-line @typescript-eslint/ban-types
}[keyof T]>

/**
 * Any method name of the associated with RPC service.
 */
export type Method<T extends Record<string, unknown>> = ServiceQuery<T>['method']

/**
 * Namespace of the RCP service
 */
export type Namespace<T extends Record<string, unknown>> = ServiceQuery<T>['namespace']

export type Values<T extends Record<string, unknown>> = T[keyof T]
export type Keys<T extends Record<string, unknown>> = keyof T

export type Inn<T extends Record<string, unknown>> = ServiceQuery<T>['input']
export type Out<T extends Record<string, unknown>> = ServiceQuery<T>['result']

export type RPCQuery<T extends Record<string, unknown>> = Pick<
ServiceQuery<T>,
'method' | 'namespace' | 'input' | 'timeout' | 'signal'
>

export type ServiceQuery<T> = Values<
{
  [NS in keyof T]: NamespacedQuery<T[NS], NS>
}
>

export type NamespacedQuery<S, NS> = Values<
{
  [M in keyof S]-?: S[M] extends (input: infer I) => infer O
    ? {
        namespace: NS
        method: M
        input: I & QueryOptions
        result: R<O>
      } & QueryOptions
    : never
}
>

type R<O> = O extends Promise<infer T>
  ? Promise<WithTransferOptions<T>>
  : Promise<WithTransferOptions<O>>

type WithTransferOptions<O> = O extends Record<string, unknown> ? O & TransferOptions : O

export type MultiService <T> = {
  [NS in keyof T]: NamespacedService<T[NS]>
}

type NamespacedService<S> = {
  [M in keyof S]: NamespacedMethod<S[M]>
}

export type NamespacedMethod<T> = T extends (arg: infer I) => infer O
  ? (query: I & QueryOptions) => Return<O>
  : never
