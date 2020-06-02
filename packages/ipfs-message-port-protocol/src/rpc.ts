export type Procedure<T> = T extends (arg: infer I) => infer O
  ? (query: I & QueryOptions) => Return<O>
  : void

export type Remote<T extends object> = {
  [K in keyof T]: Procedure<T[K]>
}

type Return<T> = T extends Promise<infer U>
  ? Promise<U & TransferOptions>
  : Promise<T & TransferOptions>

export type QueryOptions = {
  signal?: AbortSignal
  timeout?: number
  transfer?: Transferable[]
}

export type TransferOptions = {
  transfer?: Transferable[]
}

// export type ServiceProvider<T extends object> = {
//   [K in keyof T]: ProcedureProvider<T[K]>
// }

// export type ProcedureProvider<T> = T extends (arg: infer I) => infer O
//   ? (input: I & CallOptions) => O
//   : never

export type NonUndefined<A> = A extends undefined ? never : A

export type ProcedureNames<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never
}[keyof T][]

export type Input<T extends Object> = Values<
  {
    [K in keyof T]: T[K] extends (input: infer I) => infer _O
      ? I & { method: K } & QueryOptions
      : never
  }
>

export type Output<T extends Object> = Values<
  {
    [K in keyof T]: T[K] extends (input: infer _I) => infer O
      ? Return<O>
      : never
  }
>

export type Service<T> = {
  [K in keyof T]: T[K]
}

export type ProcedureProvider<T> = T extends (arg: infer I) => infer O
  ? (input: I & QueryOptions) => O
  : never

export type AsProcedure<T> = T extends (arg: infer I) => infer O
  ? (query: I & QueryOptions) => Return<O>
  : never

/**
 * Any method name of the associated with RPC service.
 */
export type Method<T extends object> = ServiceQuery<T>['method']

/**
 * Namespace of the RCP service
 */
export type Namespace<T extends object> = ServiceQuery<T>['namespace']

export type Values<T extends object> = T[keyof T]
export type Keys<T extends object> = keyof T

export type Inn<T extends object> = ServiceQuery<T>['input']
export type Out<T extends object> = ServiceQuery<T>['result']

export type RPCQuery<T extends object> = Pick<
  ServiceQuery<T>,
  'method' | 'namespace' | 'input' | 'timeout' | 'signal'
>

export type ProcedureName<T extends object> = Values<
  {
    [K in keyof T]-?: NonUndefined<T[K]> extends (input: any) => any ? K : never
  }
>

export type ServiceQuery<T> = Values<
  {
    [K in keyof T]: T[K] extends (input: infer I) => infer O
      ? Query<T>
      : NamespacedQuery<T[K], K>
  }
>

export type Query<T> = Values<
  {
    [K in keyof T]-?: T[K] extends (input: infer I) => infer O
      ? {
          namespace?: void
          method: K
          input: I
          result: R<O>
        } & QueryOptions
      : never
  }
>

export type NamespacedQuery<T, NS> = Values<
  {
    [K in keyof T]-?: T[K] extends (input: infer I) => infer O
      ? {
          namespace: NS
          method: K
          input: I
          result: R<O>
        } & QueryOptions
      : never
  }
>

type R<O> = O extends Promise<infer T>
  ? Promise<WithTransferOptions<T>>
  : Promise<WithTransferOptions<O>>

type WithTransferOptions<O> = O extends object ? O & TransferOptions : O
