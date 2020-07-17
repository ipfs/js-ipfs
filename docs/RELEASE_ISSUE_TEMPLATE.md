# Release Template

> short tl;dr; of the release

# 🗺 What's left for release

<List of items with PRs and/or Issues to be considered for this release>

# 🚢 Estimated shipping date

<Date this release will ship on if everything goes to plan (week beginning...)>

# 🔦 Highlights

<Top highlights for this release>

# 🏗 API Changes

<Any API changes breaking or otherwise that people should know of>

# ✅ Release Checklist

- [ ] **Stage 0 - Automated Testing**
  - [ ] Feature freeze. If any "non-trivial" changes (see the footnotes of [docs/releases.md](https://github.com/ipfs/js-ipfs/tree/master/docs/releases.md) for a definition) get added to the release, uncheck all the checkboxes and return to this stage.
  - [ ] Automated Testing (already tested in CI) - Ensure that all tests are passing, this includes:
    - [ ] unit/functional/integration/e2e
    - [ ] interop
    - [ ] ~~sharness~~ (Does not run `js-ipfs`)
    - [ ] all the examples run without problems
    - [ ] IPFS application testing
      - [ ] ~~[webui](https://github.com/ipfs-shipyard/ipfs-webui)~~ (Does not depend on `js-ipfs` or `js-ipfs-http-client`)
      - [ ] ~~[ipfs-desktop](https://github.com/ipfs-shipyard/ipfs-desktop)~~ (Does not depend on `js-ipfs` or `js-ipfs-http-client`)
      - [ ] [ipfs-companion](https://github.com/ipfs-shipyard/ipfs-companion)
      - [ ] [npm-on-ipfs](https://github.com/ipfs-shipyard/npm-on-ipfs)
      - [ ] [peer-base](https://github.com/peer-base/peer-base)
      - [ ] [service-worker-gateway](https://github.com/ipfs-shipyard/service-worker-gateway)
    - [ ] Third party application testing
      - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
      - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
      - [ ] [sidetree](https://github.com/decentralized-identity/sidetree)
- [ ] **Stage 1 - Internal Testing**
  - [ ] Documentation
    - [ ] Ensure that [README.md](https://github.com/ipfs/js-ipfs/tree/master/README.md) is up to date
      - [ ] Install section
      - [ ] API calls
      - [ ] Packages Listing
  - [ ] Publish a release candidate to npm
    ```sh
    # All successful builds of master update the `build/last-successful` branch
    # which contains an `npm-shrinkwrap.json`.
    # This command checks that branch out, installs it's dependencies using `npm ci`,
    # creates a release branch (e.g. release/v0.34.x), updates the minor prerelease
    # version (e.g. 0.33.1 -> 0.34.0-rc.0) and publishes it to npm.
    npx aegir publish-rc

    # Later we may wish to update the rc. First cherry-pick/otherwise merge the
    # new commits into the release branch on github (e.g. not locally) and wait
    # for CI to pass. Then update the lockfiles used by CI (n.b. one day this
    # will be done by our ci tools) with this command:
    npx aegir update-release-branch-lockfiles release/v0.34.x

    # Then update the rc published on npm. This command pulls the specified
    # release branch, installs it's dependencies `npm ci`, increments the
    # prerelease version (e.g. 0.34.0-rc.0 -> 0.34.0-rc.1) and publishes it
    # to npm.
    npx aegir update-rc release/v0.34.x
    ```
  - Network Testing:
    - test lab things - TBD
  - Infrastructure Testing:
    - TBD
- [ ] **Stage 2 - Community Dev Testing**
  - [ ] Reach out to the IPFS _early testers_ listed in [docs/EARLY_TESTERS.md](https://github.com/ipfs/js-ipfs/tree/master/docs/EARLY_TESTERS.md) for testing this release (check when no more problems have been reported). If you'd like to be added to this list, please file a PR.
  - [ ] Reach out on IRC for additional early testers.
- [ ] **Stage 3 - Community Prod Testing**
  - [ ] Update [js.ipfs.io](https://js.ipfs.io) examples to use the latest js-ipfs
  - [ ] Invite the IPFS [_early testers_](https://github.com/ipfs/js-ipfs/tree/master/docs/EARLY_TESTERS.md) to deploy the release to part of their production infrastructure.
  - [ ] Invite the wider community (link to the release issue):
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Twitter
    - [ ] IRC
- [ ] **Stage 4 - Release**
  - [ ] Take a snapshot of everyone that has contributed to this release (including its direct dependencies in IPFS, libp2p, IPLD and multiformats) using [the js-ipfs-contributors module](https://www.npmjs.com/package/js-ipfs-contributors).
  - [ ] Publish to npm:
    ```sh
    git checkout release/v0.34.x

    # Re-install dependencies using lockfile (will automatically remove your
    # node_modules folder) (Ensures the versions used for the browser build are the
    # same that have been verified by CI)
    npm ci

    # lint, build, test, tag, publish
    npm run release-minor

    # reintegrate release branch into master
    git rm npm-shrinkwrap.json yarn.lock
    git commit -m 'chore: removed lock files'
    git checkout master
    git merge release/v0.34.x
    git push
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
- Join the discussion at https://discuss.ipfs.io/ and help users finding their answers.
- Join the [🚀 IPFS Core Implementations Weekly Sync 🛰](https://github.com/ipfs/team-mgmt/issues/992) and be part of the action!

# ⁉️ Do you have questions?

The best place to ask your questions about IPFS, how it works and what you can do with it is at [discuss.ipfs.io](https://discuss.ipfs.io). We are also available at the `#ipfs` channel on Freenode.
