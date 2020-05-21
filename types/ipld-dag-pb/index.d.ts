import { Buffer } from "buffer";
import {IPLDResolver, IPLDFormatUtil} from "ipld";
import CID from "cids";
export const codec: number;

export const defaultHashAlg: number;



export class DAGLink {
  constructor(name:string, size:number, cid:string|CID)
  Name:string;
  Tsize:number;
  Hash:string;

  toJSON():DagLinkJSON;
  toString():string;
  static isDAGLink(value: any): value is DAGLink;
}

type DagLinkJSON = {
  Hash:string;
  Name:string;
  Tsize:number;
}

export type DAGNodeJSON = {
  data:Buffer
  links:DagLinkJSON[]
  size:number 
}

export class DAGNode {
  static isDAGNode(value: any): value is DAGNode

  constructor(data:Buffer|string, links?:DAGLink[],  serializedSize?:number)

  readonly Data:Buffer
  readonly Links:DagLinkJSON[]
  readonly data:Buffer
  readonly size:number
  toJSON():DAGNodeJSON
  toString():string
  toDAGLink(options?:{name?:string}):DAGLink
  addLink(link:DAGLink|DagLinkJSON|DAGNode):void;
  rmLink(nameOrCid:string|CID):void;

  serialize():Buffer;
}

export declare var resolver: IPLDResolver<DAGNode>
export declare var util:IPLDFormatUtil<DAGNode>
