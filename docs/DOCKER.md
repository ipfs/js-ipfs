
# Running js-ipfs with Docker

We have automatic Docker builds setup with Docker Hub: https://hub.docker.com/r/ipfs/js-ipfs/

All branches in the Github repository maps to a tag in Docker Hub, except `master` Git branch which is mapped to `latest` Docker tag.

You can run js-ipfs like this:

```
$ docker run -it -p 4002:4002 -p 4003:4003 -p 5002:5002 -p 9090:9090 ipfs/js-ipfs:latest

initializing ipfs node at /root/.jsipfs
generating 2048-bit RSA keypair...done
peer identity: Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
to get started, enter:

         jsipfs files cat /ipfs/QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr/readme

Initializing daemon...
Using wrtc for webrtc support
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/172.17.0.2/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/127.0.0.1/tcp/4002/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/172.17.0.2/tcp/4002/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
API is listening on: /ip4/0.0.0.0/tcp/5002
Gateway (readonly) is listening on: /ip4/0.0.0.0/tcp/9090
Daemon is ready

$ curl --silent localhost:5002/api/v0/id | jq .ID
"Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS"
```
