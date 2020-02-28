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
bagiacgzah24drzou2jlkixpblbgbg6nxfrasoklzttzoht5hixhxz3rlncyq
bagiacgzanm7fiqpp7zcfehhd7apxpo4stdxx7wxn7eqrsgolj76t22dintgq
bagiacgzau7z2cpinv6u3rnsa73ssc46cpongn7zh6ztjwo7hh7ao42cj4lha
baglacgzaoc2jzhhxe6psrvq4ixlykpky2a23e3ltnhqpjrji3uyg6rnulxpq
baglacgza2vwiqlrqgkz5jdpkzmkqznntozcnnoycn4swddtxi7njcjsmfpda
baglacgza2vwiqlrqgkz5jdpkzmkqznntozcnnoycn4swddtxi7njcjsmfpda
baglacgzar5mhc23wfjccxfkpf23kbufqqjsqg4t7btaocaraycwlxbaerq2q
baglacgzasflr3hpssk5fpdheemyogi4df2zatql5z3pp7izau7d37ryijgca
baglacgzae6kz4xubhfygknh7yqk2fbk4xztmnvwkwm36knjwukmyfepjveda
baglacgzalfkeokwk7nvwenmr2k3e3f6khvch2bw54nhr25vjmjy2lshmx5mas
```

## Explore these blocks using the DAG API

NOTE: Currently your js-ipfs daemon must NOT be running for the following examples to work.

Some examples

```sh
> jsipfs dag get bagiacgzah24drzou2jlkixpblbgbg6nxfrasoklzttzoht5hixhxz3rlncyq/
> jsipfs dag get bagiacgzah24drzou2jlkixpblbgbg6nxfrasoklzttzoht5hixhxz3rlncyq/parentHash
...
```
