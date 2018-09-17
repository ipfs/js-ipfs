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
      # Current version is 0.31.7, to publish a release candidate for 0.32.0:
      npm run build
      npm version 0.32.0-rc.1
      # Publish with "next" tag to ensure people still get 0.31.7 when they `npm i ipfs`
      npm publish --tag next
      git push origin master v0.32.0-rc.1
      ```
  - [ ] Run tests of the following projects with the new release:
    - [ ] [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room)
    - [ ] [peer-star-app](https://github.com/ipfs-shipyard/peer-star-app)
    - [ ] [ipfs-log](https://github.com/orbitdb/ipfs-log)
    - [ ] [orbit-db](https://github.com/orbitdb/orbit-db)
- Documentation
  - [ ] Ensure that README.md is up to date
  - [ ] Ensure that all the examples run
- Communication
  - [ ] Create the release issue
  - [ ] Announcements (both pre-release and post-release)
    - [ ] Twitter
    - [ ] IRC
    - [ ] Reddit
  - [ ] Blog post

# 🙌🏽 Want to contribute?

Would you like to contribute to the IPFS project and don't know how? Well, there are a few places you can get started:

- Check the issues with the `help wanted` label at the Ready column in our waffle board - https://waffle.io/ipfs/js-ipfs?label=help%20wanted
- Join an IPFS All Hands, introduce yourself and let us know where you would like to contribute - https://github.com/ipfs/pm/#all-hands-call
- Hack with IPFS and show us what you made! The All Hands call is also the perfect venue for demos, join in and show us what you built
- Join the discussion at http://discuss.ipfs.io/ and help users finding their answers.
- Join the [⚡️ⒿⓈ Core Dev Team Weekly Sync 🙌🏽](https://github.com/ipfs/pm/issues/650) and be part of the Sprint action!

# ⁉️ Do you have questions?

The best place to ask your questions about IPFS, how it works and what you can do with it is at [discuss.ipfs.io](http://discuss.ipfs.io). We are also available at the #ipfs channel on Freenode.
