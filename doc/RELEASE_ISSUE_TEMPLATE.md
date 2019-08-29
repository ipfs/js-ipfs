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
  - Network Testing:
    - test lab things - TBD
  - Infrastructure Testing:
    - TBD
  - [ ] IPFS Application Testing -  Run the tests of the following applications:
    - [ ] [webui](https://github.com/ipfs-shipyard/ipfs-webui)
    - [ ] [ipfs-desktop](https://github.com/ipfs-shipyard/ipfs-desktop)
    - [ ] [ipfs-companion](https://github.com/ipfs-shipyard/ipfs-companion)
    - [ ] [npm-on-ipfs](https://github.com/ipfs-shipyard/npm-on-ipfs)
    - [ ] [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room)
    - [ ] [peer-base](https://github.com/peer-base/peer-base)
    - [ ] [service-worker-gateway](https://github.com/ipfs-shipyard/service-worker-gateway)
- [ ] **Stage 2 - Community Dev Testing**
  - [ ] Reach out to the IPFS _early testers_ listed in [doc/EARLY_TESTERS.md](https://github.com/ipfs/js-ipfs/tree/master/doc/EARLY_TESTERS.md) for testing this release (check when no more problems have been reported). If you'd like to be added to this list, please file a PR.
  - [ ] Reach out to on IRC for additional early testers.
  - [ ] Run tests available in the following repos with the latest beta (check when all tests pass):
    - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
    - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
- [ ] **Stage 3 - Community Prod Testing**
  - [ ] Documentation
    - [ ] Ensure that [CHANGELOG.md](https://github.com/ipfs/go-ipfs/tree/master/CHANGELOG.md) is up to date
    - [ ] Ensure that [README.md](https://github.com/ipfs/go-ipfs/tree/master/README.md)  is up to date
    - [ ] Ensure that all the examples we have produced for go-ipfs run without problems
    - [ ] Update HTTP-API Documentation on the Website using https://github.com/ipfs/http-api-docs
  - [ ] Invite the IPFS [_early testers_](https://github.com/ipfs/go-ipfs/tree/master/docs/EARLY_TESTERS.md) to deploy the release to part of their production infrastructure.
  - [ ] Invite the wider community through (link to the release issue):
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Twitter
    - [ ] IRC
- [ ] **Stage 4 - Release**
  - [ ] Final preparation
    - [ ] Verify that version string in [`repo/version.go`](https://github.com/ipfs/go-ipfs/tree/master/repo/version.go) has been updated
    - [ ] tag commit with vX.Y.Z
    - [ ] update release branch to point to release commit (`git merge vX.Y.Z`).
    - [ ] Release published
      - [ ] to [dist.ipfs.io](https://dist.ipfs.io)
      - [ ] to [npm-go-ipfs](https://github.com/ipfs/npm-go-ipfs)
      - [ ] to [chocolatey](https://chocolatey.org/packages/ipfs)
      - [ ] to [github](https://github.com/ipfs/go-ipfs/releases)
  - [ ] Publish a Release Blog post (at minimum, a c&p of this release issue with all the highlights, API changes, link to changelog and thank yous)
  - [ ] Broadcasting (link to blog post)
    - [ ] Twitter
    - [ ] IRC
    - [ ] [Reddit](https://reddit.com/r/ipfs)
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Announce it on the [IPFS Users Mailing List](https://groups.google.com/forum/#!forum/ipfs-users)









- Robustness and quality


  - [ ] Run tests of the following projects with the new release:
    - [ ] [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room)
    - [ ] [peer-base](https://github.com/peer-base/peer-base)
    - [ ] [service-worker-gateway](https://github.com/ipfs-shipyard/service-worker-gateway)
    - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
    - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
  - [ ] Update js.ipfs.io examples and Service Worker Gateway to use latest js-ipfs
- Documentation
  - [ ] Ensure that README.md is up to date
  - [ ] Ensure that all the examples run
- Communication
  - [ ] Create the release issue
  - [ ] Take a snapshot of everyone that has contributed to this release (including its subdeps in IPFS, libp2p, IPLD and multiformats) using [`name-your-contributors`](https://www.npmjs.com/package/name-your-contributors). Generate a nice markdown list with [this script](https://gist.github.com/alanshaw/5a2d9465c5a05b201d949551bdb1fcc3).
  - [ ] Announcements (both pre-release and post-release)
    - [ ] Twitter
    - [ ] IRC
    - [ ] Reddit
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Announce it on the [IPFS Users mlist](https://groups.google.com/forum/#!forum/ipfs-users)
  - [ ] Blog post
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
