module pe.app1.loaded {

  export class MethodNode extends BaseNode {

    name: string;
    parameters: any[];
    accessor: string = '';

    constructor(
      parent: TypeNode,
      public methodInfo: managed.MethodInfo) {

      super(parent);

      this.details = methodInfo;

      if (methodInfo.attributes & managed.metadata.MethodAttributes.Private)
        this.accessor = 'private';
      else if (methodInfo.attributes & managed.metadata.MethodAttributes.Public)
        this.accessor = 'public';

      this.name = this.methodInfo.name;
      this.parameters = this.methodInfo.parameters;
    }

  }

}