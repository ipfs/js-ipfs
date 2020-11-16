# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.2.0...ipfs-cli@0.2.1) (2020-11-16)


### Bug Fixes

* correct raw leaves setting ([#3401](https://github.com/ipfs/js-ipfs/issues/3401)) ([c0703ef](https://github.com/ipfs/js-ipfs/commit/c0703ef78626a91186e0c7c3374584283367c064))
* report ipfs.add progress over http ([#3310](https://github.com/ipfs/js-ipfs/issues/3310)) ([39cad4b](https://github.com/ipfs/js-ipfs/commit/39cad4b76b950ea6a76477fd01f8631b8bd9aa1e))





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.1.0...ipfs-cli@0.2.0) (2020-11-09)


### Bug Fixes

* remove electron-webrtc dependency ([#3378](https://github.com/ipfs/js-ipfs/issues/3378)) ([2bd5368](https://github.com/ipfs/js-ipfs/commit/2bd53686003527a102db9df92cedad4c6d9164f9)), closes [#3376](https://github.com/ipfs/js-ipfs/issues/3376)


### BREAKING CHANGES

* electron-webrtc was accidentally bundled with ipfs, now it needs installing separately





# 0.1.0 (2020-10-28)


### Bug Fixes

* error invalid version triggered in cli pin add/rm ([#3306](https://github.com/ipfs/js-ipfs/issues/3306)) ([69757f3](https://github.com/ipfs/js-ipfs/commit/69757f3c321c5d135ebde7a262c169427e4f1105)), closes [/github.com/ipfs/js-ipfs/blob/master/docs/core-api/PIN.md#returns-1](https://github.com//github.com/ipfs/js-ipfs/blob/master/docs/core-api/PIN.md/issues/returns-1)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))
