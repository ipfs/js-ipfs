## commands.js

`commands.js` contains a small framework-like class that can be used for generating
HTTP + CLI commands from within the components. It's a type-less schema defined as
JS objects.

It's made for be able to easier reuse logic between components and avoiding boilerplate
for each command in the codebase.






### Steps for migrating a legacy-command to new `commands.js`

- Identify which method to abstract. In this case we chose `id` as it's simple.

- Identify which files will be affected. In this case, we can see the following:

```console
$ find src | grep -i id
src/core/components/id.js
src/cli/commands/id.js
src/http/api/resources/id.js
src/http/api/routes/id.js
```

- API definitions will live in `src/core/components/id.js`. The rest of the files
  will later be removed.

- To make testing easier, we should only run tests that tests `id` when we're
  refactoring. Make the `describe` suits be `describe.only` instead. Here is the
  rest of the ID tests. We also have to change `node_modules/interface-ipfs-core/js/src/miscellaneous/id.js`
  as there is a test there as well.

```
$ find test | grep -i id
test/cli/id.js
test/http-api/id.js
```

- Now we can run `yarn test:node:http && yarn test:node:cli` to quickly know
  everything is alright. Make sure to run this at least once before starting your
  refactor as otherwise some tests might be failing on `master` already and you
  don't know until you run the tests without your changes.

- Second step is to remove the `id` command from the CLI and HTTP api, rerun the
  tests and make sure they are failing.

- For the CLI, we need to remove `src/cli/commands/id.js` as otherwise it'll be
  automatically loaded by yargs and override our refactor

- For the HTTP api, we can comment out `require('./id')(server)` from `src/http/api/routes/index.js`
  and comment out `exports.id = require('./id')` in `src/http/resources/index.js`

- If you now rerun the tests, they should all fail as we don't have any ID command anymore.

- In the bottom, add the following part. It should be exported *together* with the component
  itself.

```js
module.exports.__api = {
  name: 'id',
  description: 'Shows IPFS Node ID info',
  // Call is the actual command, whatever it returns gets passed to cli.post and
  // http.post for formatting
  call: (self, options, callback) => {
    return self.id(callback)
  },
  cli: {
    // This is how you would call it in the CLI
    command: 'id',
    post: (id, printer) => {
      printer(JSON.stringify(id, null, 2))
    }
  },
  http: {
    post: (id) => {
      return {
        ID: id.id,
        PublicKey: id.publicKey,
        Addresses: id.addresses,
        AgentVersion: id.agentVersion,
        ProtocolVersion: id.protocolVersion
      }
    }
  }
}
```

- Now we have a basic command ready, let's add it. In `src/cli/bin.js` line ~91,
  require and include the api to the commands. Do the same in `src/http/index.js` line ~135.

- Aaaand we're done! Tests should now be passing without troubles and you can remove the
  rest of the files.

To see a more complicated example. checkout `src/components/block.js` which has sub-commands,
streaming output, preloading and more.
