// @ts-check
/* eslint-env browser, serviceworker */
import IPFS from "ipfs-message-port-client"
import { defer, selectClient } from "./service/util"

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
        // port for it.
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
  const ipfs = await createIPFSClient(event)
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
    // Collect directory entries. If happens to contain `index.html` create a
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
   * Obtains MessagePort for the SharedWorker operating IPFS node and
   * creates a client for it.
   *
   * @param {Fetch} context
   */
const createIPFSClient = async (context) => {
  // Selects a service worker client that can be used to obtain a message port
  // from, then sends a request to it and once a response is obtained, creates a
  // IPFS client and returns it
  const client = await selectClient(context.target)
  const port = await requestIPFSPort(client)
  return IPFS.from(port)
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


/** @type {Record<string, { promise: Promise<MessagePort>, resolve(port:MessagPort):void, reject(error:Error):void }>} */
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
 */
