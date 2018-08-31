// const path = require('path')

const apiPrefix = '/api/v0'

const getRouteForCmd = (cmd, routes, prefix) => {
  if (routes === undefined) {
    routes = []
  }
  let name
  if (prefix) {
    name = `${prefix}/${cmd.name}`
  } else {
    name = `${apiPrefix}/${cmd.name}`
  }

  let pre = []
  if (cmd.http && cmd.http.pre) {
    pre = [{
      method: cmd.http.pre,
      assign: 'args'
    }]
  } else {
    pre = [{
      method: (request, reply) => {
        reply({[cmd.args[0]]: request.query.arg})
      },
      assign: 'args'
    }]
  }

  const call = cmd.http ? (cmd.http.call || cmd.call) : cmd.call
  let post = cmd.http ? (cmd.http.post || cmd.post) : cmd.post
  if (!post) {
    post = (res) => {
      return res
    }
  }

  routes.push({
    method: '*',
    path: name,
    config: {
      payload: cmd.payload || {},
      pre: pre,
      handler: (request, reply) => {
        const ipfsNode = request.server.app.ipfs
        const options = {}
        const callCallback = (err, res) => {
          if (err) {
            reply({
              Message: 'Error: ' + err,
              Code: 0
            }).code(500)
          }
          reply(post(res))
        }
        let moreArgs = []
        if (cmd.args) {
          moreArgs = cmd.args.map((arg) => {
            return request.pre.args[arg]
          }) || []
        }
        const callArgs = [
          ipfsNode,
          ...moreArgs,
          options,
          callCallback
        ]
        call.apply(this, callArgs)
      }
    }
  })
  if (cmd.children) {
    routes.concat(cmd.children.map((child) => getRouteForCmd(child, routes, name)))
  }
  return routes
}

const getCliForCmd = (cmd) => {
  const name = (cmd.cli && cmd.cli.command) || cmd.name
  return {
    command: name,
    description: cmd.description,
    builder: (cmd.cli && cmd.cli.builder) || function (argv) {
      if (cmd.children) {
        cmd.children.forEach((child) => {
          argv.command(getCliForCmd(child))
        })
      }
    },
    handler: (argv) => {
      const pre = (cmd.cli && cmd.cli.pre) || (cmd.pre || function (args, cb) { cb(null, args) })
      const call = (cmd.cli && cmd.cli.call) || (cmd.call || function (self, args, options, cb) { cb(null, args) })
      const post = (cmd.cli && cmd.cli.post) || (cmd.post || function (res, printer) { })

      let options = {}
      if (cmd.cli && cmd.cli.builder) {
        // TODO should support `alias` as well
        options = Object.keys(cmd.cli.builder).reduce((acc, curr) => {
          const defaultValue = cmd.cli.builder[curr].default
          const value = argv[curr] || defaultValue
          return Object.assign(acc, {
            [curr]: value
          })
        }, {})
      }

      const callCallback = (err, res) => {
        if (err) throw err
        post(res, argv.printer)
      }

      pre(argv, (err, preRes) => {
        if (err) throw err
        let moreArgs = []
        if (cmd.args) {
          moreArgs = cmd.args.map((arg) => {
            return preRes[arg] || argv[arg]
          }) || []
        }
        const callArgs = [
          argv.ipfs,
          ...moreArgs,
          options,
          callCallback
        ]
        call.apply(this, callArgs)
      })
    }
  }
}

class Commands {
  constructor () {
    this.commands = []
  }
  add (cmd) {
    this.commands.push(cmd)
  }
  initHTTP (server) {
    const api = server.select('API')

    const routes = this.commands.reduce((acc, cmd) => {
      const routes = acc.concat(getRouteForCmd(cmd))
      return routes
    }, [])
    routes.forEach((route) => api.route(route))
  }
  initCLI (cli) {
    const cmds = this.commands.map(getCliForCmd)
    cmds.forEach(cmd => {
      cli.command(cmd)
    })
    return cmds
  }
}

module.exports = Commands
