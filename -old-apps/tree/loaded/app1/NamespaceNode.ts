module pe.app1.loaded {

  export class NamespaceNode extends BaseNodeWithChildren {

    types = ko.observableArray<TypeNode>([]);

    constructor(
      parent: BaseNodeWithChildren,
      public name: string,
      private _types: { [name: string]: managed.Type; }) {
      super(parent);
        if (this.name === null) this.name = '{}';
    }

    populateOnExpand() {
      var orderedNames = Object.keys(this._types).sort();
      var types = orderedNames
        .filter(name=> this._types.hasOwnProperty(name))
        .map(name => new TypeNode(this, name, this._types[name]));
      this.types(types);
    }

  }

}