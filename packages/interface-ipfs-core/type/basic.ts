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
