// This file contains some utility types that either can't be expressed in
// JSDoc syntax or that result in a different behaviour when typed in JSDoc.

export interface MessagePortClientOptions {
  transfer?: Set<Transferable>
}
