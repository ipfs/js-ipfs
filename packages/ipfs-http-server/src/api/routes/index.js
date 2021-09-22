import bitswapRoutes from './bitswap.js'
import blockRoutes from './block.js'
import bootstrapRoutes from './bootstrap.js'
import configRoutes from './config.js'
import dagRoutes from './dag.js'
import debugRoutes from './debug.js'
import dhtRoutes from './dht.js'
import dnsRoutes from './dns.js'
import filesRegularRoutes from './files-regular.js'
import filesRoutes from './files.js'
import idRoutes from './id.js'
import keyRoutes from './key.js'
import nameRoutes from './name.js'
import objectRoutes from './object.js'
import pinRoutes from './pin.js'
import pingRoutes from './ping.js'
import pubsubRoutes from './pubsub.js'
import repoRoutes from './repo.js'
import resolveRoutes from './resolve.js'
import shutdownRoutes from './shutdown.js'
import statsRoutes from './stats.js'
import swarmRoutes from './swarm.js'
import versionRoutes from './version.js'
import webuiRoutes from './webui.js'

/** @type {import('@hapi/hapi').ServerRoute[]} */
export const routes = []

routes.push(
  ...bitswapRoutes,
  ...blockRoutes,
  ...bootstrapRoutes,
  ...configRoutes,
  ...dagRoutes,
  ...debugRoutes,
  ...dhtRoutes,
  ...dnsRoutes,
  ...filesRegularRoutes,
  ...filesRoutes,
  ...idRoutes,
  ...keyRoutes,
  ...nameRoutes,
  ...objectRoutes,
  ...pinRoutes,
  ...pingRoutes,
  ...pubsubRoutes,
  ...repoRoutes,
  ...resolveRoutes,
  ...shutdownRoutes,
  ...statsRoutes,
  ...swarmRoutes,
  ...versionRoutes,
  ...webuiRoutes
)
