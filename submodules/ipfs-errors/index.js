module.exports = {

  // signals that a value is of size greater than the allowed maximum
  MaxSizeExceededError: new Error('maximum size exceeded'),

  // signal that an item was not found
  NotFoundError: new Error('not found'),

  // signal that a function is not yet implemented
  NotImplementedError: new Error('not implemented'),

  // used to validate params in functions that expect a Block
  RequiresBlockError: new Error('requires block (Block)'),

  // used to validate callbacks
  RequiresCallbackError: new Error('requires callback (function)'),

  // used to validate params in functions that expect a multihash key
  RequiresKeyMultihashError: new Error('requires key (multihash)'),

  // used to validate params in functions that expect a buffer value
  RequiresValueBufferError: new Error('requires value (Buffer)'),

  // used to signal to users that they should be expecting result in callbacks
  ReturnCallbackError: new Error('returns to callback'),
}
