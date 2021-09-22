import { isElectronRenderer, isBrowser } from 'wherearewe'
import { transport as nodeTransport } from './transport.node.js'
import { transport as browserTransport } from './transport.browser.js'

export function transport () {
  // In electron-renderer we use the browser transport
  if (isElectronRenderer || isBrowser) {
    return browserTransport()
  } else {
    return nodeTransport()
  }
}
