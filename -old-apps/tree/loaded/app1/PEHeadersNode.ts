module pe.app1.loaded {

  export class PEHeadersNode extends BaseNode {

    constructor(
      parent: BaseNodeWithChildren,
      public headers: headers.PEFileHeaders) {
      super(parent);
      this.details = headers;
    }

  }

}