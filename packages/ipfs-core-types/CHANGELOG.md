# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.5.1...ipfs-core-types@0.5.2) (2021-06-18)

**Note:** Version bump only for package ipfs-core-types





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.5.0...ipfs-core-types@0.5.1) (2021-06-05)


### Bug Fixes

* add onError to pubsub.subscribe types ([#3706](https://github.com/ipfs/js-ipfs/issues/3706)) ([d910aea](https://github.com/ipfs/js-ipfs/commit/d910aead8c8be6798cf838245511331b3f69634c)), closes [#3468](https://github.com/ipfs/js-ipfs/issues/3468)





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.4.0...ipfs-core-types@0.5.0) (2021-05-26)


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.3.1...ipfs-core-types@0.4.0) (2021-05-10)


### Bug Fixes

* fix types ([#3662](https://github.com/ipfs/js-ipfs/issues/3662)) ([0fe8892](https://github.com/ipfs/js-ipfs/commit/0fe8892361180dab53ed3c3b006479b32a792d44))
* loosen input type for swarm.connect and swarm.disconnect ([#3673](https://github.com/ipfs/js-ipfs/issues/3673)) ([46618c7](https://github.com/ipfs/js-ipfs/commit/46618c795bf5363ba3186645640fb81349231db7)), closes [#3638](https://github.com/ipfs/js-ipfs/issues/3638)
* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))
* update ipfs repo ([#3671](https://github.com/ipfs/js-ipfs/issues/3671)) ([9029ee5](https://github.com/ipfs/js-ipfs/commit/9029ee591fa74ea65c9600f2d249897e933416fa))
* update types after feedback from ceramic ([#3657](https://github.com/ipfs/js-ipfs/issues/3657)) ([0ddbb1b](https://github.com/ipfs/js-ipfs/commit/0ddbb1b1deb4e40dac3e365d7f98a5f174c2ce8f)), closes [#3640](https://github.com/ipfs/js-ipfs/issues/3640)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.3.0...ipfs-core-types@0.3.1) (2021-03-09)


### Bug Fixes

* bitswap related typedefs ([#3580](https://github.com/ipfs/js-ipfs/issues/3580)) ([1af82d1](https://github.com/ipfs/js-ipfs/commit/1af82d1ca4bd447d8c162e1fd8da8b043131969c))
* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.2.1...ipfs-core-types@0.3.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* support  remote pinning services in ipfs-http-client ([#3293](https://github.com/ipfs/js-ipfs/issues/3293)) ([ba240fd](https://github.com/ipfs/js-ipfs/commit/ba240fdf93edc88028315483240d7822a7ca88ed))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.2.0...ipfs-core-types@0.2.1) (2021-01-22)


### Bug Fixes

* issue with isolateModules flag ([#3495](https://github.com/ipfs/js-ipfs/issues/3495)) ([839e190](https://github.com/ipfs/js-ipfs/commit/839e1908f3c050b45af176883a7e450fb339bef0)), closes [#3494](https://github.com/ipfs/js-ipfs/issues/3494) [#3498](https://github.com/ipfs/js-ipfs/issues/3498) [/github.com/ipfs-shipyard/ipfs-webui/pull/1655#issuecomment-763846124](https://github.com//github.com/ipfs-shipyard/ipfs-webui/pull/1655/issues/issuecomment-763846124)





# 0.2.0 (2021-01-15)


### Features

* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)
