# Release Template

> short tl;dr; of the release

# 🗺 What's left for release

<List of items with PRs and/or Issues to be considered for this release>

# 🔦 Highlights

<Top highlights for this release>

# 🏗 API Changes

<Any API changes breaking or otherwise that people should know of>

# ✅ Release Checklist

- [ ] **Stage 0 - Automated Testing**
  - [ ] Feature freeze. If any "non-trivial" changes (see the footnotes of [doc/releases.md](https://github.com/ipfs/js-ipfs/tree/master/doc/releases.md) for a definition) get added to the release, uncheck all the checkboxes and return to this stage.
  - [ ] Automated Testing (already tested in CI) - Ensure that all tests are passing, this includes:
    - [ ] unit/functional/integration/e2e
    - [ ] interop
    - [ ] sharness
- [ ] **Stage 1 - Internal Testing**
  - [ ] Publish a release candidate to npm
    ```sh
    # Clean out node_modules and re-install dependencies
    # (Ensures you have the latest versions for the browser build)
    rm -rf node_modules package-lock.json
    npm install

    # Minor prerelease (e.g. 0.33.1 -> 0.34.0-rc.0)
    npx aegir release --type preminor --preid rc --dist-tag next

    # Increment prerelease (e.g. 0.34.0-rc.0 -> 0.34.0-rc.1)
    npx aegir release --type prerelease --preid rc --dist-tag next
    ```
  - Network Testing:
    - test lab things - TBD
  - Infrastructure Testing:
    - TBD
  - [ ] IPFS Application Testing - Run the tests of the following applications:
    - [ ] [webui](https://github.com/ipfs-shipyard/ipfs-webui)
    - [ ] [ipfs-desktop](https://github.com/ipfs-shipyard/ipfs-desktop)
    - [ ] [ipfs-companion](https://github.com/ipfs-shipyard/ipfs-companion)
    - [ ] [npm-on-ipfs](https://github.com/ipfs-shipyard/npm-on-ipfs)
    - [ ] [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room)
    - [ ] [peer-base](https://github.com/peer-base/peer-base)
    - [ ] [service-worker-gateway](https://github.com/ipfs-shipyard/service-worker-gateway)
- [ ] **Stage 2 - Community Dev Testing**
  - [ ] Reach out to the IPFS _early testers_ listed in [doc/EARLY_TESTERS.md](https://github.com/ipfs/js-ipfs/tree/master/doc/EARLY_TESTERS.md) for testing this release (check when no more problems have been reported). If you'd like to be added to this list, please file a PR.
  - [ ] Reach out on IRC for additional early testers.
  - [ ] Run tests available in the following repos with the latest RC:
    - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
    - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
- [ ] **Stage 3 - Community Prod Testing**
  - [ ] Documentation
    - [ ] Ensure that [README.md](https://github.com/ipfs/js-ipfs/tree/master/README.md) is up to date
    - [ ] Ensure that all the examples run without problems:
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-add-readable-stream
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-browserify
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-mfs
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-parceljs
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-readablestream
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-script-tag
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-video-streaming
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-vue
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/browser-webpack
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/custom-ipfs-repo
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/exchange-files-in-browser
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/explore-ethereum-blockchain
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/ipfs-101
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/run-in-electron
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/running-multiple-nodes
      - [ ] https://github.com/ipfs/js-ipfs/tree/master/examples/traverse-ipld-graphs
    - [ ] Update [js.ipfs.io](https://js.ipfs.io) examples to use the latest js-ipfs
  - [ ] Invite the IPFS [_early testers_](https://github.com/ipfs/js-ipfs/tree/master/doc/EARLY_TESTERS.md) to deploy the release to part of their production infrastructure.
  - [ ] Invite the wider community (link to the release issue):
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Twitter
    - [ ] IRC
- [ ] **Stage 4 - Release**
  - [ ] Take a snapshot of everyone that has contributed to this release (including its direct dependencies in IPFS, libp2p, IPLD and multiformats) using [this script](https://gist.github.com/alanshaw/5a2d9465c5a05b201d949551bdb1fcc3).
  - [ ] Publish to npm:
    ```sh
    # Clean out node_modules and re-install dependencies
    # (Ensures you have the latest versions for the browser build)
    rm -rf node_modules package-lock.json
    npm install

    # lint, build, test, tag, publish
    npm run release-minor
    ```
  - [ ] Publish a blog post to [github.com/ipfs/blog](https://github.com/ipfs/blog) (at minimum, a c&p of this release issue with all the highlights, API changes and thank yous)
  - [ ] Broadcasting (link to blog post)
    - [ ] Twitter
    - [ ] IRC
    - [ ] [Reddit](https://reddit.com/r/ipfs)
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Announce it on the [IPFS Users Mailing List](https://groups.google.com/forum/#!forum/ipfs-users)
  - [ ] Copy release notes to the [GitHub Release description](https://github.com/ipfs/js-ipfs/releases)

# ❤️ Huge thank you to everyone that made this release possible

<Generated contributor list>

# 🙌🏽 Want to contribute?

Would you like to contribute to the IPFS project and don't know how? Well, there are a few places you can get started:

- Check the issues with the `help wanted` label in the [js-ipfs repo](https://github.com/ipfs/js-ipfs/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
- Join an IPFS All Hands, introduce yourself and let us know where you would like to contribute - https://github.com/ipfs/team-mgmt/#weekly-ipfs-all-hands
- Hack with IPFS and show us what you made! The All Hands call is also the perfect venue for demos, join in and show us what you built
- Join the discussion at http://discuss.ipfs.io/ and help users finding their answers.
- Join the [🚀 IPFS Core Implementations Weekly Sync 🛰](https://github.com/ipfs/team-mgmt/issues/992) and be part of the action!

# ⁉️ Do you have questions?

The best place to ask your questions about IPFS, how it works and what you can do with it is at [discuss.ipfs.io](http://discuss.ipfs.io). We are also available at the `#ipfs` channel on Freenode.
