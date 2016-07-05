module pe.managed {

  export class Type {

    isSpeculative = true;

    attributes: metadata.TypeAttributes = 0;
    fields: FieldInfo[] = [];
    methods: MethodInfo[] = [];
    properties: PropertyInfo[] = [];
    events: EventInfo[] = [];

    genericPrototype: Type = null;
    genericArguments: Type[] = [];

    interfaces: Type[] = [];
    netedTypes: Type[] = [];
    nestingParent: Type = null;

    layout: { packingSize: number; classSize: number; } = null;

    customAttributes: any[] = null;

    constructor(
      public baseType?: Type,
      public assembly?: Assembly,
      public namespace?: string,
      public name?: string) {
    }

    getBaseType() { return this.baseType; }
    getAssembly() { return this.assembly; }
    getFullName() {
      if (this.namespace && this.namespace.length)
        return this.namespace + "." + this.name;
      else
        return this.name;
    }

    toString() {
      if (this.genericArguments.length) {
        var fullName = this.getFullName();
        var qpos = fullName.indexOf('`');
        if (qpos >= 0)
          fullName = fullName.substring(0, qpos);
        fullName += '<' + this.genericArguments.join(',') + '>';
        return fullName;
      }
      else {
        return this.getFullName();
      }
    }
  }

}