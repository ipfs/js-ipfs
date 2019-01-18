# Release Template

> short tl;dr; of the release

# 🗺 What's left for release

# 🔦 Highlights

# 🏗 API Changes

# ✅ Release Checklist

- Robustness and quality
  - [ ] Ensure that all tests are passing, this includes:
    - [ ] unit
    - [ ] interop
    - [ ] sharness
  - [ ] Publish a release candidate to npm
      ```sh
      # Minor prerelease (e.g. 0.33.1 -> 0.34.0-rc.0)
      $ npx aegir release --type preminor --preid rc --dist-tag next

      # Increment prerelease (e.g. 0.34.0-rc.0 -> 0.34.0-rc.1)
      $ npx aegir release --type prerelease --preid rc --dist-tag next
      ```
  - [ ] Run tests of the following projects with the new release:
    - [ ] [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room)
    - [ ] [peer-base](https://github.com/peer-base/peer-base)
    - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
    - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
    - [ ] [service-worker-gateway](https://github.com/ipfs-shipyard/service-worker-gateway)
- Documentation
  - [ ] Ensure that README.md is up to date
  - [ ] Ensure that all the examples run
- Communication
  - [ ] Create the release issue
  - [ ] Take a snapshot between of everyone that has contributed to this release (including its subdeps in IPFS, libp2p, IPLD and multiformats) using [`name-your-contributors`](https://www.npmjs.com/package/name-your-contributors). Generate a nice markdown list with [this script](https://gist.github.com/alanshaw/5a2d9465c5a05b201d949551bdb1fcc3).
  - [ ] Announcements (both pre-release and post-release)
    - [ ] Twitter
    - [ ] IRC
    - [ ] Reddit
    - [ ] [discuss.ipfs.io](https://discuss.ipfs.io/c/announcements)
    - [ ] Announce it on the [IPFS Users mlist](https://groups.google.com/forum/#!forum/ipfs-users)
  - [ ] Blog post
  - [ ] Copy release notes to the [GitHub Release description](https://github.com/ipfs/js-ipfs/releases)

# ❤️ Huge thank you to everyone that made this release possible

In alphabetical order, here are all the humans that contributed to the release:

- ...

# 🙌🏽 Want to contribute?

Would you like to contribute to the IPFS project and don't know how? Well, there are a few places you can get started:

- Check the issues with the `help wanted` label at the Ready column in our waffle board - https://waffle.io/ipfs/js-ipfs?label=help%20wanted
- Join an IPFS All Hands, introduce yourself and let us know where you would like to contribute - https://github.com/ipfs/team-mgmt/#weekly-ipfs-all-hands
- Hack with IPFS and show us what you made! The All Hands call is also the perfect venue for demos, join in and show us what you built
- Join the discussion at http://discuss.ipfs.io/ and help users finding their answers.
- Join the [⚡️ⒿⓈ Core Dev Team Weekly Sync 🙌🏽](https://github.com/ipfs/team-mgmt/issues/650) and be part of the Sprint action!

# ⁉️ Do you have questions?

The best place to ask your questions about IPFS, how it works and what you can do with it is at [discuss.ipfs.io](http://discuss.ipfs.io). We are also available at the `#ipfs` channel on Freenode.
