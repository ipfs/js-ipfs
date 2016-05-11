# Contributing

## Setup

You should have [node.js], [npm] and [gulp] installed.

## Linting

Linting is done using [eslint] and the rules are based on [standard].

```bash
$ gulp lint
```

## Tests

Tests in node

```bash
$ gulp test:node
```

Tests in the browser

```bash
$ gulp test:browser
```

## Building browser version

```bash
$ gulp build
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
$ gulp release --major
# Minor relase
$ gulp release --minor
# Patch release
$ gulp release
```

[node.js]: https://nodejs.org/
[npm]: http://npmjs.org/
[gulp]: http://gulpjs.com/
[eslint]: http://eslint.org/
[standard]: https://github.com/feross/standard
