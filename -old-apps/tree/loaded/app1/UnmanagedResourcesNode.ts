module pe.app1.loaded {

  export class UnmanagedResourcesNode extends BaseNodeWithChildren {

    resources: UnmanagedResourcesNode[] = [];

    constructor(
      parent: BaseNodeWithChildren) {
      super(parent);
    }

    populateOnExpand() {
      // 
    }

  }

}