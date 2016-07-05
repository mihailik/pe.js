module pe.managed {

  export class Assembly {

    isSpeculative: boolean = true;

    fileHeaders = new headers.PEFileHeaders();

    name: string = "";
    version: string = null;
    publicKey: number[] = null;
    publicKeyToken: string = null;
    culture: string = null;
    attributes: metadata.AssemblyFlags = 0;

    runtimeVersion: string = "";
    specificRuntimeVersion: string = "";
    imageFlags: metadata.ClrImageFlags = 0;
    metadataVersion: string = "";
    tableStreamVersion: string = "";
    generation: number = 0;
    moduleName: string = "";
    mvid: string = "";
    encId: string = "";
    encBaseId: string = "";

    types: Type[] = [];
    customAttributes: any[] = [];

    toString() {
      return this.name + ", Version=" + this.version + ", Culture=" + (this.culture ? this.culture : "neutral") + ", PublicKeyToken=" + (this.publicKeyToken && this.publicKeyToken.length ? this.publicKeyToken : "null");
    }
  }

}