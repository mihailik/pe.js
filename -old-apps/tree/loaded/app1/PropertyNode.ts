module pe.app1.loaded {

  export class PropertyNode extends BaseNode {

    name: string;

    constructor(
      parent: BaseNodeWithChildren,
      public propertyInfo: managed.PropertyInfo) {
      super(parent);
      this.name = this.propertyInfo.name;
    }

  }

}