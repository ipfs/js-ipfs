/* eslint-env browser, serviceworker */
import IPFS from "ipfs-message-port-client"

/**
 * @param {LifecycleEvent} event 
 */
const oninstall = async (event) => {
  // We don't want to wait for old workers to be deactivated before the
  // new one gets activated
  event.waitUntil(event.target.skipWaiting())
}

/**
 * @param {LifecycleEvent} event 
 */
const onactivate = async (event) => {
  // We want to start handling requests right away, so that requests from the
  // very first page will be handled by service worker. Which is why we claim
  // clients.
  event.waitUntil(event.target.clients.claim())
}

/**
 * @param {Fetch} event 
 */
const onfetch = (event) => {
  const url = new URL(event.request.url)
  switch (url.origin) {
    // Our service worker only serves pages for its own page origin
    case location.origin: {
      const [,protocol] = url.pathname.split('/')
      switch (protocol) {
        // If requests are for `/ipfs/...` or `/ipns/` URLs we respond with
        // a content viewer which is a page containing an iframe
        // for actual content like <iframe src=`/view${url.pathname}` />
        // and a script that we can talk to in order to obtain a connection to the shared IPFS node via a MessagePort.
        // This might be confusing but this wrapper page is what allows this
        // service worker to obtain a MessagePort, otherwise there may not even
        // be a page that will start a shared worker, nor a way to get a message
        // port if on is present.
        case 'ipfs':
        case 'ipns':
          return event.respondWith(fetchViewer({ url }))
        // If requests are for `/view/...` URL those are requests from iframes
        // for the content.
        case 'view':
          return event.respondWith(fetchContent({
            event,
            path: url.pathname.slice(protocol.length + 1)
          }))
        // Anything else might be for scripts, source maps etc.. we just fetch
        // those from network
        default:
          return event.respondWith(fetch(event.request))
      }
    }
    // Requests to other origins are fetched from the network.
    default: {
      return event.respondWith(fetch(event.request))
    }
  }
}

/**
 * Generates a simple page which:
 * 
 * 1. Embeds JS that will provide us message port on request.
 * 2. Embeds iframe to load an actual content.
 * 
 * @param {Object} options
 * @param {URL} options.url
 */
const fetchViewer = async ({ url }) => {
  const body = new Blob([`<html data-viewer>
<head>
  <title>${url.pathname}</title>
  <script src="/main.js"></script>
</head>
<body>
  <iframe id="viewer" style="width:100%;height:100%;position:fixed;top:0;left:0;border:none;" src="/view${url.pathname}"></iframe>
</body>

</html>
`], { type: 'text/html'})
  return new Response(body, {
    status: 200
  })  
}



/**
 * Fetches content from the IPFS and responds with it. 
 * 
 * @param {Object} options
 * @param {Fetch} options.event
 * @param {string} options.path
 */
const fetchContent = async ({ event, path }) => {
  const [,protocol] = path.split('/')
  switch (protocol) {
    case 'ipns': {
      return await fetchIPNSContent({
        event,
        path
      })
    }
    case 'ipfs':
      return await fetchIPFSContent({
        event,
        path
     })
    default: {
      const response = await unsupportedProtocol(protocol)
      return response
    }
  }
}

/**
 * @param {Object} options
 * @param {Fetch} options.event 
 * @param {string} options.path
 */
const fetchIPNSContent = async ({/* path, event */}) => {
  // Challenge: Implement IPNS support.
  return new Response(`<html>
  <body>
    <h1>IPNS protocol support is not implemented</h1>
    <p>It is left as an excercise to the viewer</p>
  </body>
</html>`, {
    statusText: "IPNS support is not implemented",
    status: 502
  })
}


/**
 * @param {Object} options
 * @param {Fetch} options.event 
 * @param {string} options.path
 */
const fetchIPFSContent = async ({ event, path }) => {
  // Obtains IPFS instance
  const ipfs = await new IPFSService().use(event)
  try {
    // Attempt to fetch the file for the path.
    return await fetchIPFSFile(ipfs, path)
  } catch ({ message }) {
    // Above can fail because path might be for a directory, if so
    // respond with diretory listing.
    if (message.includes('dag node is a directory')) {
      // Ensure ends with `/` so that generated file URLs would resolve properly
      if (path.endsWith('/')) {
        return fetchIPFSDirectory(ipfs, path)
      } else {
        return Response.redirect(`${event.request.url}/`)
      }
    }

    // If such link does not exists respond with 404
    if (message.startsWith('no link named')) {
      return new Response(message, {
        statusText: message,
        status: 404
      })
    }

    // If problem with CID respond with 400
    if (message.startsWith('multihash length inconsistent') || 
        message.startsWith('Non-base58 character'))
    {
      return new Response(message, {
        statusText: message,
        status: 400
      })
    }

    // Otherwise respond with 500
    return new Response(message, {
      statusText: message,
      status: 500
    })
  }
}

/**
 * @param {IPFS} ipfs 
 * @param {string} path
 */
const fetchIPFSFile = async (ipfs, path) => {
  const content = ipfs.cat(path)
  // We get back `AsyncIterable<Uint8Array>`, but if such file does not exists
  // we will only know once we start reading. To respond with a stream that
  // fails we attempt to read first chunk and only then produce a response
  // instance. This ensures that we either error or return a Response that doesn't
  // immediately fail.
  const chunks = content[Symbol.asyncIterator]()
  const head = await chunks.next()
  const body = new ReadableStream({
    /**
     * @param {ReadableStreamDefaultController} controller 
     */
    start(controller) {
      if (head.done) {
        controller.close()
      } else {
        controller.enqueue(head.value)
      }
    },
    /**
     * @param {ReadableStreamDefaultController} controller 
     */
    async pull(controller) {
      try {
        const chunk = await chunks.next()
        if (chunk.done) {
          controller.close()
        } else {
          controller.enqueue(chunk.value)
        }
      } catch(error) {
        controller.error(error)
      }
    }
  })

  return new Response(body, {
    status: 200
  })
}

/**
 * @param {IPFS} ipfs 
 * @param {string} path
 */
const fetchIPFSDirectory = async (ipfs, path) => {
  try {
    // Collect diretory entries. If happens to contain `index.html` create a
    // response containing that file otherwise respond with a directory listing.
    const entries = []
    for await (const entry of ipfs.ls(path)) {
      if (entry.name === 'index.html') {
        return fetchIPFSFile(ipfs, entry.path)
      }
      entries.push(entry)
    }
    return new Response(renderDirectory(path, entries), {
      headers: {
        'content-type': 'text/html'
      },
      status: 404
    })
  } catch({message}) {
    return new Response(message, {
      statusText: message,
      status: 500
    })
  }
}

/**
 * @param {string} path
 * @param {import('ipfs-message-port-client/src/core').LsEntry[]} entries 
 */
const renderDirectory = (path, entries) => `<html>
  <h3>Index of ${path}<h3>
  <ul>
    ${entries.map(renderDirectoryEntry).join('\n')}
  </ul>
</html>`

/**
 * @param {import('ipfs-message-port-client/src/core').LsEntry} entry
 */
const renderDirectoryEntry = (entry) =>
`<li>
  <div class="type-${entry.type}"><a href="${entry.path}">${entry.name}<a></div>
  </div>${entry.cid.toString()}</div>
</li>`


/**
 * @param {string} protocol 
 */
const unsupportedProtocol = async (protocol) => {
  return new Response(`<html>
    <body>
      <h1>Protocol ${protocol} is not supported</h1>
    </body>
</html>`, {
  statusText: `Unsupported protocol ${protocol}`,
  status: 405
})
}

/**
 * Class is used to create IPFS clients for nodes in shared worker. Since service
 * worker may get multiple concurrent requests (e.g when pages with html, js,
 * images are loaded) we might either have IPFS client ready or have a request
 * to obtain message port for it in flight. This class encapsulates details to
 * deal with this concurrency.
 */
class IPFSService {
  constructor() {
    /** @type {State<IPFS>} */
    this.state = { status: 'idle' }
  }

  /**
   * Obtains message port for the SharedWorker operating IPFS node and
   * creates a client for it.
   *
   * @param {Fetch} context
   */
  static async activate (context) {
    // Selects a service worker client that can be used to obtain a message port
    // from, then sends a request to it and once a response is obtained, creates a
    // IPFS client and returns it
    const client = await selectClient(context)
    const port = await requestIPFSPort(client)
    return IPFS.from(port)
  }
  /**
   * Just a wrapper around `activate` that deals with state machine.
   * 
   * @param {IPFSService} self
   * @param {Fetch} context
   */
  static async use(self, context) {
    const { state } = self
    switch (state.status) {
      // If "idle" call `activate` and transtion to "pending" state and once
      // returned promise resolves transition to "ready" state.
      case 'idle': {
        try {
          const ready = IPFSService.activate(context)
          self.state = { status: 'pending', ready }
          const value = await ready
          self.state = { status: 'ready', value }
          return value
        // If error occurs transition back to `idle` state.
        } catch (error) {
          self.state = { status: 'idle' }
          throw error
        }
      }
      // If "pending" request just wait for completion and return
      case 'pending': {
        return await state.ready
      }
      // If "ready" just return the value.
      case 'ready': {
        return state.value
      }
    }
  }
  /**
   * Just sugar for `IPFSService.use(this, event)`
   * 
   * @param {Fetch} event
   * @returns {Promise<IPFS>}
   */
  use(event) {
    return IPFSService.use(this, event)
  }
}


/**
 * Find a window client that can provide a message port for a shared worker.
 * @param {Fetch} context
 * @returns {Promise<WindowClient>}
 */
const selectClient = async ({ target, clientId  }) => {
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
const scoreClient = ({ frameType, type, focused, visibilityState }) => {
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
 * Sends a message prot request to the window client and waits for the response.
 * Returns promise for the message port it will receive.
 *
 * @param {WindowClient} client
 * @returns {Promise<MessagePort>}
 */
const requestIPFSPort = (client) => {
  // We might receive multiple concurrent requests from the same client (e.g.
  // images, scripts, stylesheets for the page) to avoid creating a port for
  // each request we use a little table keyed by client id instead.
  const request = portRequests[client.id]
  if (request == null) {
    const request = defer()
    portRequests[client.id] = request
    client.postMessage({
      method: 'ipfs-message-port',
      id: client.id
    })
    return request.promise
  } else {
    return request.promise
  }
}


/** @type {Record<string, PromiseController<Error, MessagePort>>} */
const portRequests = Object.create(null)

/**
 * Listens to the messages from the clients if it is response to pending message
 * port request resolves it.
 *
 * @param {MessageEvent} event 
 */
const onmessage = ({data}) => {
  if (data) {
    const request = portRequests[data.id]
    if (request != null) {
      delete portRequests[data.id]
      if (data.port instanceof MessagePort) {
        request.resolve(data.port)
      } else {
        request.reject(new Error(data.error))
      }
    }
  }
}

/**
 * Utility function to create a `promise` and it's `resolve`, `reject`
 * controllers.
 *
 * @template X,T
 * @returns {PromiseController<X,T>}
 */
const defer = () => {
  /** @type {PromiseController<X,T>} */
  const controller = {}
  controller.promise = new Promise((resolve, reject) => {
    controller.resolve = resolve
    controller.reject = reject
  })

  return controller
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
 * Sets up service worker event handlers.
 * @param {any} self 
 */
const setup = (self) => {
  self.oninstall = oninstall
  self.onactivate = onactivate
  self.onfetch = onfetch
  self.onmessage = onmessage
}

setup(self)


/**
 * @typedef {FetchEvent & { target: Scope }} Fetch
 * @typedef {ExtendableEvent & { target: Scope }} LifecycleEvent
 * @typedef {ServiceWorkerGlobalScope & { onMessagePort: (event:MessageEvent) => void }} Scope 
 * @typedef {Object} MessagePortRequest
 * 
 */
/**
 * @template X,T
 * @typedef {Object} PromiseController
 * @property {(ok:T) => void} resolve
 * @property {(error:X) => void} reject
 * @property {Promise<T>} promise
 */
/**
 * @template T
 * @typedef {{ status: 'idle' }
 * | { status: 'pending', ready: Promise<T> }
 * | { status: 'ready', value: T }
 * } State
 */
