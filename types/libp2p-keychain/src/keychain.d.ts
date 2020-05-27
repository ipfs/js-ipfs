type KeyInfo = {
  id: string
  name: string
}

declare class Keychain {
  findKeyById(id:string):KeyInfo
  generateOptions():any
  options():any
  createKey(name:string, type:string, size:number):Promise<KeyInfo>
  listKeys():Promise<KeyInfo[]>
  findKeyById(id:string):Promise<KeyInfo>
  findKeyByName(name:string):Promise<KeyInfo>
  removeKey(name:string):Promise<KeyInfo>
  renameKey(oldName:string, newName:string):Promise<KeyInfo>
  exportKey(name:string, password:string):Promise<string>
  importKey(name:string, pem:string, password:string):Promise<KeyInfo>
  importPeer(name:string, peer:any):Promise<KeyInfo>
}

declare namespace Keychain {
  export { KeyInfo }
}

export = Keychain