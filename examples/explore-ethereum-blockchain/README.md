# Use IPFS to explore the Ethereum Blockchain

> This is a pre-example to a full Ethereum to IPFS bridge. It shows how to resolve Ethereum hashes through the IPFS DAG get API.

## Set up

Make sure to have the latest js-ipfs installed by doing

```sh
> npm install ipfs -g
```

If this is the first time you use js-ipfs, make sure to init your repo with

```sh
> jsipfs init
```

## Load ethereum chain data into ipfs

We've some ethereum blocks available at [eth-stuffs](./eth-stuffs) folder, you can add them to ipfs by running:

```sh
> ./load-eth-stuffs.sh
z43AaGEvwdfzjrCZ3Sq7DKxdDHrwoaPQDtqF4jfdkNEVTiqGVFW
z43AaGEywSDX5PUJcrn5GfZmb6FjisJyR7uahhWPk456f7k7LDA
z43AaGF42R2DXsU65bNnHRCypLPr9sg6D7CUws5raiqATVaB1jj
z45oqTS2AQ9SgyVa31LRGZgfibtdoPvP2miMNaXbDLLgD9MdAAr
z45oqTS8wZaNGU2eepKHRbXvmV93cKQbiL241RB3bRtMYZP8hNm
z45oqTS8wZaNGU2eepKHRbXvmV93cKQbiL241RB3bRtMYZP8hNm
z45oqTS4E1GeJujnKVJG3xSVnS64A8mMCWhKSkCWACNCeD95mtQ
z45oqTS4MnurEeEaanvFieeJDNHH3jGNk9NJEiyrwXwYQSWfxUB
z45oqTRwExySeMeivsU1Y9UdzWDp2mx71TtQhmTGzRaXCcsNujj
z45oqTRzb9a5xyvx5RbfSXH1K5jibyZ4AxnXyYReuLw7KU5veYw
```

## Explore these blocks using the DAG api

Some examples

```sh
> jsipfs dag get z43AaGEvwdfzjrCZ3Sq7DKxdDHrwoaPQDtqF4jfdkNEVTiqGVFW/
> jsipfs dag get z43AaGEvwdfzjrCZ3Sq7DKxdDHrwoaPQDtqF4jfdkNEVTiqGVFW/parentHash
...
```
