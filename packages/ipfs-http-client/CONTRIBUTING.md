# Contributing

## Setup

You should have [node.js] and [npm] installed.

## Linting

Linting is done using [eslint] and the rules are based on [standard].

```bash
$ npm run lint
```

## Tests

Tests in node

```bash
$ npm run test:node
```

Tests in the browser

```bash
$ npm run test:browser
```

### Writing a new core interface test

The core interface tests are kept in a separate repo, because they are used by multiple other projects. To add a core interface test, follow this guide:

1. Clone this project repo and the interface core tests repo:
    * `git clone https://github.com/ipfs/js-ipfs-http-client.git`
    * `git clone https://github.com/ipfs/interface-js-ipfs-core.git`
1. Install dependencies and globally [link](https://docs.npmjs.com/cli/link) the interface core tests:
    * `cd interface-js-ipfs-core`
    * `npm install`
    * `npm link`
1. Write your test
1. Install dependencies for this project and link to the interface core tests
    * `cd ../js-ipfs-http-client`
    * `npm install`
    * `npm link interface-ipfs-core`
1. Run the tests:
    * `npm test`

Next:

1. Send a PR to `ipfs/interface-js-ipfs-core` (please also add to the documentation!)
1. This will be reviewed by a core contributor and they will perform the same steps as above
1. When merged, a new version of `interface-ipfs-core` will be released
1. Finally, a PR needs to be created or updated to `ipfs/js-ipfs-http-client` to use the new version

## Building browser version

```bash
$ npm run build
```

## Releases

The `release` task will

1. Run a build
2. Commit the build
3. Bump the version in `package.json`
4. Commit the version change
5. Create a git tag
6. Run `git push` to `upstream/master` (You can change this with `--remote my-remote`)

```bash
# Major release
$ npm run release-major
# Minor relase
$ npm run release-minor
# Patch release
$ npm run release
```

[node.js]: https://nodejs.org/
[npm]: http://npmjs.org/
[eslint]: http://eslint.org/
[standard]: https://github.com/feross/standard
