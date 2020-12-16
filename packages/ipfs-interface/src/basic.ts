/**
 * Represents a value that you can await on, which is either value or a promise
 * of one.
 */
export type Await<T> =
  | T
  | Promise<T>

/**
 * Represents an iterable that can be used in `for await` loops, that is either
 * iterable or an async iterable.
 */
export type AwaitIterable<T> =
  | Iterable<T>
  | AsyncIterable<T>

/**
 * Common options across all cancellable requests.
 */
export interface AbortOptions {
  /**
   * Can be provided to a function that starts a long running task, which will
   * be aborted when signal is triggered.
   */
  signal?: AbortSignal
  /**
   * Can be provided to a function that starts a long running task, which will
   * be aborted after provided timeout (in ms).
   */
  timeout?: number
}

export type ToJSON =
  | null
  | string
  | number
  | boolean
  | ToJSON[]
  | { toJSON?: () => ToJSON } & { [key: string]: ToJSON }
