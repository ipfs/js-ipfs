import parser from './parser.js'
import commandAlias from './command-alias.js'

/**
 * @param {string[]} command
 * @param {import('yargs').MiddlewareFunction} ctxMiddleware
 */
export async function cli (command, ctxMiddleware) {
  // Apply command aliasing (eg `refs local` -> `refs-local`)
  command = commandAlias(command)

  await parser()
    .middleware(ctxMiddleware)
    .parse(command)
}
