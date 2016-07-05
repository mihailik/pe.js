module pe.app1.loaded {

  export class ReferencesNode extends BaseNode {

    constructor(
      parent: BaseNodeWithChildren,
      assembly: managed.Assembly) {
      super(parent);
    }

  }

}