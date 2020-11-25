// @ts-check
/* eslint-env browser, serviceworker */
import IPFS from "ipfs-message-port-client"
import { defer, selectClient, toReadableStream } from "./service/util"

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
    const stat = await ipfs.files.stat(path)
    switch (stat.type) {
      case 'file': {
        return await fetchIPFSFile(ipfs, path)
      }
      case 'directory': {
        if (!path.endsWith('/')) {
          return Response.redirect(`${event.request.url}/`)
        } else {
          // try index.html file in this directory if there is such file
          // render it otherwise render directory
          const index = `${path}index.html`
          const stat = await ipfs.files.stat(index).catch(() => ({ type: null }))
          return stat.type === 'file'
            ? fetchIPFSFile(ipfs, index)
            : fetchIPFSDirectory(ipfs, path)
        }
      }
      default: {
        // If non file redirect to ipld explorer
        return Response.redirect(`https://explore.ipld.io/#/explore${path}`)
      }
    }
  } catch ({ message }) {
    console.error(message)

    // If such link does not exists respond with 404
    if (message.startsWith('no link named') || message.includes('does not exist')) {
      return new Response(message, {
        statusText: message,
        status: 404
      })
    }

    // If problem with CID respond with 400
    if (message.includes('invalid')) {
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
  const body = toReadableStream(content)
  // Note: Browsers by default perform content sniffing to do a content type
  // decetion https://developer.mozilla.org/en-US/docs/Mozilla/How_Mozilla_determines_MIME_Types
  // but it is limited to web relevant content and seems to exclude svg.
  // Here we fix svg support that otherwise breaks many pages doing proper content
  // type detection is left as an excercise to the reader.
  const contentType = path.endsWith('.svg') ? { 'content-type': 'image/svg+xml' } : null

  return new Response(body, {
    status: 200,
    headers: {
      ...contentType
    }
  })
}

/**
 * @param {IPFS} ipfs 
 * @param {string} path
 */
const fetchIPFSDirectory = async (ipfs, path) => {
  return new Response(toReadableStream(renderDirectory(ipfs, path)), {
    headers: {
      'content-type': 'text/html'
    },
    status: 200
  })
}

/**
 * @param {IPFS} ipfs 
 * @param {string} path
 * @param {number} [limit=174]
 * @returns {AsyncIterable<Uint8Array>}
 */
const renderDirectory = async function * (ipfs, path, limit = 64) {
  const encoder = new TextEncoder()
  yield encoder.encode(`<html><h3>Index of ${path}<h3><ul>`)
  
  for await (const entry of ipfs.ls(path)) {
    yield encoder.encode(renderDirectoryEntry(path, entry))
    if (--limit < 0) {
      break
    }
  }

  yield encoder.encode(`</ul>${limit < 0 ? PAGINATION_NOTE : ''}</html>`)
}

const PAGINATION_NOTE = '<h2>Directory has too many entries</h2><p><mark>Implementing a pagination is left as an excercise to the viewer</mark></p></h2>'

/**
 * @param {string} base
 * @param {import('ipfs-message-port-client/src/core').LsEntry} entry
 */
const renderDirectoryEntry = (base, entry) =>
`<li>
  <div class="type-${entry.type}"><a href="/view${base}${entry.name}">${entry.name}<a></div>
  <small>${entry.cid.toString()}</small>
  <details><pre>${JSON.stringify(entry, null, 2)}</pre></details>
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


/** @type {Record<string, { promise: Promise<MessagePort>, resolve(port:MessagePort):void, reject(error:Error):void }>} */
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
