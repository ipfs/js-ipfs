# ipfs-mount

Mount ipfs paths via FUSE.

Thanks to FUSE, Fuse4js, and the awesome [mafintosh/torrent-mount](https://github.com/mafintosh/torrent-mount), upon which this module is based.

## Install

#### 1. Install FUSE

- OSX: download the latest [osxfuse here](http://sourceforge.net/projects/osxfuse/files/latest/download?source=files). The one in brew doesn't always work.
- Other platforms: [click here for directions](https://github.com/bcle/fuse4js#requirements).

#### 2. Install `pkg-config`

```
brew install pkg-config
```

#### 3. Install `ipfs-mount`

```
git clone https://github.com/jbenet/node-ipfs
cd node-ipfs/submodules/ipfs-mount
npm link
```

(This will be in npm soon).

## Usage

### Mount ipfs

```
sudo mkdir /ipfs
sudo chown `whoami` /ipfs
ipfs-mount / /ipfs
```

Now, you have the entire ipfs web under `/ipfs` :)

### Mount an ipfs subpath

```
ipfs-mount <ipfs-path> <local-path>
```

Try: (TODO)
