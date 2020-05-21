import CID from "cids"
import { Buffer } from "buffer"


declare class Block {
  constructor(data:Buffer, cid:CID)
  readonly data:Buffer  
  readonly cid:CID
  static isBlock(input:any): input is Block
}


export = Block;