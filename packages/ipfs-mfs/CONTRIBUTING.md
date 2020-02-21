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
