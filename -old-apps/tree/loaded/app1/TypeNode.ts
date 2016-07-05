module pe.app1.loaded {

  export class TypeNode extends BaseNodeWithChildren {

    methods = ko.observableArray<MethodNode>([]);
    properties = ko.observableArray<PropertyNode>([]);
    fields = ko.observableArray<FieldNode>([]);

    constructor(
      parent: NamespaceNode,
      public name: string,
      public type: managed.Type) {
      super(parent);
      this.details = type;
    }

    populateOnExpand() { 
      this.methods(this.type.methods.sort(compareNamed).map(m=> new MethodNode(this, m)));
      this.properties(this.type.properties.sort(compareNamed).map(p=> new PropertyNode(this, p)));
      this.fields(this.type.fields.sort(compareNamed).map(f => new FieldNode(this, f)));
    }
  }

  function compareNamed(n1: { name: string; }, n2: { name: string; }) {
    return compareStrings(n1.name, n2.name);
  }

  function compareStrings(s1: string, s2: string) {
    return s1 > s2 ? +1 : s1 < s2 ? -1 : 0;
  }

}