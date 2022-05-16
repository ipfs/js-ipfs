import { NotStartedError, AlreadyStartingError, AlreadyStartedError } from '../errors.js'
import { withTimeout } from '../utils.js'

/**
 * @template T
 * @typedef {import('ipfs-core-types/src/utils').Await<T>} Await
 */
/**
 * @template {(options:any) => any} T
 * @typedef {Parameters<T>[0]} Options
 */
/**
 * @template {(options:any) => any} T
 * @typedef {ReturnType<T> extends ? Promise<infer U> ? U : ReturnType<T>} State
 */
/**
 * Represents service state which can be not started in which case
 * it is instance of `Error`. Pending in which case it's promise or
 * ready in which case it is the value itself.
 *
 * @template T
 * @typedef {{ status: 'stopped' }
 * | { status: 'starting', ready: Await<T> }
 * | { status: 'started', value: T }
 * | { status: 'stopping', ready: Await<void> }
 * } ServiceState
 */

/**
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @template Options, T
 *
 * Allows you to create a handle to service that can be started or
 * stopped. It enables defining components that need to use service
 * functionality before service is started.
 *
 */
export class Service {
  /**
   * Takes `activation` function that takes `options` and (async) returns
   * an implementation.
   *
   * @template {(options:any) => Await<any>} T
   *
   * @param {object} config
   * @param {T} config.start
   * @param {(state:State<T>) => Await<void>} [config.stop]
   * @returns {Service<Parameters<T>[0], State<T>>}
   */
  static create ({ start, stop }) {
    return new Service(start, stop)
  }

  /**
   * Starts the service (by running actiavtion function). Will (async) throw
   * unless service is stopped.
   *
   * @template Options, T
   * @param {Service<Options, T>} service
   * @param {Options} options
   * @returns {Promise<T>}
   */
  static async start (service, options) {
    const { state, activate } = service
    switch (state.status) {
      // If service is in 'stopped' state we activate and transition to
      // to 'pending' state. Once activation is complete transition state to
      // 'started' state.
      // Note: This is the only code that does state transitions from
      // - stopped
      // - started
      // Which ensures no race conditions can occur.
      case 'stopped': {
        try {
          const promise = activate(options)
          service.state = { status: 'starting', ready: promise }
          // Note: MUST await after state transition above otherwise race
          // condition may occur.
          const result = await promise
          service.state = { status: 'started', value: result }
          return result
        // If failed to start, transiton from 'starting' to 'stopped'
        // state.
        } catch (/** @type {any} */ error) {
          service.state = { status: 'stopped' }
          throw error
        }
      }
      case 'starting': {
        throw new AlreadyStartingError()
      }
      case 'started': {
        throw new AlreadyStartedError()
      }
      // If service is stopping we just wait for that to complete
      // and try again.
      case 'stopping': {
        await state.ready
        return await Service.start(service, options)
      }
      default: {
        return Service.panic(service)
      }
    }
  }

  /**
   * Stops the service by executing deactivation. If service is stopped
   * or is stopping this is noop. If service is starting up when called
   * it will await for start to complete and then retry stop afterwards.
   * This may (async) throw if `deactivate` does.
   *
   * @template T
   * @param {Service<any, T>} service
   * @returns {Promise<void>}
   */
  static async stop (service) {
    const { state, deactivate } = service
    switch (state.status) {
      // If stopped there's nothing to do.
      case 'stopped': {
        break
      }
      // If service is starting we await for it to complete
      // and try again. That way
      case 'starting': {
        // We do not want to error stop if start failed.
        try { await state.ready } catch (/** @type {any} */ _) {}
        return await Service.stop(service)
      }
      // if service is stopping we just await for it to complete.
      case 'stopping': {
        return await state.ready
      }
      case 'started': {
        if (deactivate) {
          await deactivate(state.value)
        }
        service.state = { status: 'stopped' }
        break
      }
      default: {
        Service.panic(state)
      }
    }
  }

  /**
   * @template T
   * @param {Service<any, T>} service
   * @returns {T|null}
   */
  static try ({ state }) {
    switch (state.status) {
      case 'started':
        return state.value
      default:
        return null
    }
  }

  /**
   * Unwraps state and returns underlying value. If state is in idle state it
   * will throw an error. If state is pending it will wait and return the
   * result or throw on failure. If state is ready returns result.
   *
   * @template T
   * @param {Service<any, T>} service
   * @param {AbortOptions} [options]
   * @returns {Promise<T>}
   */
  static async use ({ state }, options) {
    switch (state.status) {
      case 'started':
        return state.value
      case 'starting':
        return await withTimeout(state.ready, options)
      default:
        throw new NotStartedError()
    }
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @private
   * @param {Service<any, any>} service
   * @returns {never}
   */
  static panic ({ state }) {
    const status = JSON.stringify({ status: state.status })
    throw RangeError(`Service in invalid state ${status}, should never happen if you see this please report a bug`)
  }

  /**
   * Takes `activation` function that takes `options` and (async) returns
   * an implementation.
   *
   * @private
   * @param {(options:Options) => Await<T>} activate
   * @param {(state:T) => Await<void>} [deactivate]
   */
  constructor (activate, deactivate) {
    this.activate = activate
    this.deactivate = deactivate

    /**
     * A state machine for this service.
     *
     * @private
     * @type {ServiceState<T>}
     */
    this.state = { status: 'stopped' }
  }

  /**
   * Allows you to asynchronously obtain service implementation. If service
   * is starting it will await for completion. If service is stopped or stopping
   * this will (async) throw exception. This allows components that need to use
   * this service convenient API to do it.
   *
   * @param {AbortOptions} [options] - Abort options.
   * @returns {Promise<T>}
   */
  async use (options) {
    return await Service.use(this, options)
  }

  /**
   * @returns {T|null}
   */
  try () {
    return Service.try(this)
  }
}
