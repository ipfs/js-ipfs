/**
 * Find a window client with the best score.
 *
 * @param {ServiceWorkerGlobalScope} target
 * @param {(client:WindowClient) => number} [scoreClient]
 * @returns {Promise<WindowClient>}
 */
export const selectClient = async (target, scoreClient = scoreWindowClient) => {
  // Get all the controlled window clients, score them and use the best one if
  // it is visible.
  const controlled = await getWindowClients(target)
  const [best] = controlled.sort((a, b) => scoreClient(b) - scoreClient(a))
  if (best && best.visibilityState === 'visible') {
    return best
  // Otherwise collect all window client (including not yet controlled ones)
  // score them and use the best one.
  } else {
    const clients = await getWindowClients(target, true)
    const [best] = clients.sort((a, b) => scoreClient(b) - scoreClient(a))
    if (best) {
      return best
    } else {
      // In theory this should never happen because all the content is loaded
      // from iframes that have windows.
      throw new Error('No viable client can be found')
    }
  }
}

/**
 * @param {WindowClient} client 
 */
const scoreWindowClient = ({ frameType, type, focused, visibilityState }) => {
  // Eliminate nested clients because they won't embed JS that responds to our request.
  const top = frameType === "nested" ? 0 : 1
  // If not a window it's not use to us.
  const typeScore = type === 'window' ? 1 : 0
  // if not visible it can't execute js so not use for us either.
  const visibiltyScore = visibilityState === 'visible' ? 1 : 0
  // if not focused it's event loop may be throttled so prefer focused.
  const focusScore = focused ? 2 : 1
  return typeScore * focusScore * visibiltyScore * top
}



/**
 * Utility function to get window clients.
 *
 * @param {ServiceWorkerGlobalScope} target 
 * @param {boolean} [includeUncontrolled=false]
 * @returns {Promise<WindowClient[]>}
 */
const getWindowClients = async (target, includeUncontrolled=false) => {
  const clients = await target.clients.matchAll({
    type: 'window',
    includeUncontrolled
  })
  return /** @type {WindowClient[]} */ (clients)
}

/**
 * Utility function to create a `promise` and it's `resolve`, `reject`
 * controllers.
 *
 * @template X,T
 * @returns {PromiseController<X,T>}
 */
export const defer = () => {
  /** @type {PromiseController<X,T>} */
  const controller = {}
  controller.promise = new Promise((resolve, reject) => {
    controller.resolve = resolve
    controller.reject = reject
  })

  return controller
}

/**
 * @template T
 * @param {(AsyncIterable<T> & { return?: () => {}}) | AsyncGenerator<T, any, any>} source
 * @returns {ReadableStream<T>}
 */
export const toReadableStream = (source) => {
  const iterator = source[Symbol.asyncIterator]()
  return new ReadableStream({
    /**
     * @param {ReadableStreamDefaultController} controller 
     */
    async pull(controller) {
      try {
        const chunk = await iterator.next()
        if (chunk.done) {
          controller.close()
        } else {
          controller.enqueue(chunk.value)
        }
      } catch(error) {
        controller.error(error)
      }
    },
    /**
     * @param {any} reason 
     */
    cancel(reason) {
      if (source.return) {
        source.return(reason)
      }
    }
  })
}

/**
 * @template X,T
 * @typedef {Object} PromiseController
 * @property {(ok:T) => void} resolve
 * @property {(error:X) => void} reject
 * @property {Promise<T>} promise
 */
