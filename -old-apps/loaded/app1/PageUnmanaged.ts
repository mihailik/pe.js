module pe.app1.loaded {

  export class PageUnmanaged { 

    peHeaders: PEHeadersNode;

    unmanagedImports: UnmanagedImportsNode;
    unmanagedResources: UnmanagedResourcesNode;

    constructor(
      private _headers: headers.PEFileHeaders) {

      this.peHeaders = new PEHeadersNode(null, this._headers);

      this.unmanagedImports = new UnmanagedImportsNode(null);
      this.unmanagedResources = new UnmanagedResourcesNode(null);

    }

  }
}