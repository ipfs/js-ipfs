'use strict'

// This is an entry point to our program.
const main = async () => { 
  // We start a shared worker where IPFS node is loaded.
  const worker = createIPFSWorker()
  // @ts-ignore - Store worker in the window so that it's available in console.
  window.worker = createIPFSWorker()
  
  // Service workers do not have access to the `SharedWorker` API
  // (see https://github.com/w3c/ServiceWorker/issues/678)
  // To overcome that limitation the page will listen for the service worker message
  // and provide it with a message port to the shared worker, which will enable
  // it to use our (shared) IPFS node.
  navigator.serviceWorker.onmessage = onServiceWorkerMessage

  // @ts-ignore - register expects string but weback requires this URL hack.
  await navigator.serviceWorker.register(new URL('./service.js', import.meta.url), { scope: '/' })

  await navigator.serviceWorker.ready

  // This is just for testing, lets us know when SW is ready.
  const meta = document.createElement("meta")
  meta.name = "sw-ready"
  document.head.appendChild(meta)

  // URLs like `localhost:3000/ipfs/Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD`
  // are loaded from service worker. However it could be that such a URL is loaded
  // before the service worker was registered in which case our server just loads a blank
  // page (that doesn't have data-viewer attribute). If that is the case we load
  // the actual IPFS content after the SW is ready.
  if (document.documentElement.dataset.viewer == null) {
    load(location.pathname)
  }
}

/**
 * @param {string} path 
 */
const load = async (path) => {
  const [,protocol] = path.split('/')
  switch (protocol) {
    case 'ipfs':
    case 'ipns': {
      document.body.innerHTML = `<iframe id="viewer" style="width:100%;height:100%;position:fixed;top:0;left:0;border:none;" src="/view${path}"></iframe>`
    }
  }
}

/**
 * Handles ipfs message port request from service worker and
 * responds to it with it.
 *
 * @param {MessageEvent} event 
 */
const onServiceWorkerMessage = (event) => {
  /** @type {null|ServiceWorker} */
  const serviceWorker = (event.source)
  if (serviceWorker == null) return
  switch (event.data.method) {
    case 'ipfs-message-port': {
      // Receives request from service worker, creates a new shared worker and
      // responds back with the message port.
      // Note: MessagePort can be transferred only once which is why we need to
      // create a SharedWorker each time. However a ServiceWorker is only created
      // once (in main function) all other creations just create port to it.
      const worker = createIPFSWorker()
      return serviceWorker.postMessage({
        method: 'ipfs-message-port',
        id: event.data.id,
        port: worker.port
      }, [worker.port])
    }
  }
}

/**
 * Creates a shared worker instance that exposes JS-IPFS node over MessagePort.
 * @returns {SharedWorker}
 */
const createIPFSWorker = () => new SharedWorker(
  // @ts-ignore - Constructor takes string but webpack needs URL
  new URL('./worker.js', import.meta.url),
  'IPFS'
)

main()
