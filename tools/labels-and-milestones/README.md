# labels-and-milestones Sync for js-ipfs

> Sync labels and milestones across Github repositories

This is a fork of [haadcode/labels-and-milestones](https://github.com/haadcode/labels-and-milestones). We are using it in a particular way. Check out the Readme in that repo for the "normal" usage instructions.

## Requirements

**IMPORTANT** This script must be run using a Github personal access token corresponding to an account that has the ability to ADD MILESTONES to all of the repositories listed in `js-ipfs-milestones.config.json`.

- Set `GITHUB_TOKEN` env var to Github personal access token
- Install node/npm
- Clone this repo

## Install

First install dependencies

```bash
npm install
```

## Configure

Edit `js-ipfs-milestones.config.json` to list the repositories you want to sync to along with thethe Milestones and labels you want to sync.

## Run the Sync Tool

Then run the sync tool, providing the config file you want to use

```bash
npm run sync-milestones
```

This command will read `js-ipfs-milestones.config.json` and sync the labels and milestones to the target repos.

#### Running via CI

This will need some work. See [haadcode/labels-and-milestones](https://github.com/haadcode/labels-and-milestones) for more info.
