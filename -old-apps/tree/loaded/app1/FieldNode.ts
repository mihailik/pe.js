module pe.app1.loaded {

  export class FieldNode extends BaseNode {

    name: string;
    accessor: string = '';

    constructor(
      parent: TypeNode,
      public fieldInfo: managed.FieldInfo) {

      super(parent);

      if (fieldInfo.attributes & managed.metadata.FieldAttributes.Public)
        this.accessor = 'public';
      else if (fieldInfo.attributes & managed.metadata.FieldAttributes.Private)
        this.accessor = 'private';

      if (fieldInfo.attributes & managed.metadata.FieldAttributes.Literal)
        this.accessor += ' const';
      else if (fieldInfo.attributes & managed.metadata.FieldAttributes.InitOnly)
        this.accessor += ' readonly';

      this.name = this.fieldInfo.name;

      this.details = fieldInfo;
    }
  }

}