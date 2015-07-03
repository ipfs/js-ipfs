# ipfs-objects-git - Git-like objects for IPFS

This module provides a set of IPFS objects following Git's example. The mapping is not exact, though:

```
ipfs commit <---> git commit
ipfs tree   <---> git tree
ipfs list   <---> git blob
ipfs block  <---/
```

More on what these objects do in the ipfs paper, available from the [ipfs repo](https://github.com/jbenet/ipfs).

