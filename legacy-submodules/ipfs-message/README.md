# ipfs-message

This is the ipfs network message. It follows a simple format:

```protobuf
// An IPFS Message
message Message {
  optional bytes source = 1; // peer address
  optional bytes destination = 2; // peer address

  message Payload {
    optional Protocol protocol = 1;
    optional bytes data = 2;
  }

  repeated Payload payload = 3; // protocol payloads
}
```
