'use strict'

/**
 * Protobuf interface
 * from go-ipfs/pin/internal/pb/header.proto
 */
module.exports = `
  syntax = "proto2";

  package ipfs.pin;

  option go_package = "pb";

  message Set {
    optional uint32 version = 1;
    optional uint32 fanout = 2;
    optional fixed32 seed = 3;
  }
`
