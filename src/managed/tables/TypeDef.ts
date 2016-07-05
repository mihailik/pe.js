module pe.managed.tables {

  /** ECMA-335 II.22.37 */
  export class TypeDef {

    def = new managed.Type();

    name: number = 0;
    namespace: number = 0;
    extends_: number = 0;
    fieldList: number = 0;
    methodList: number = 0;

    constructor() {
      this.def.isSpeculative = false;
    }

    read(reader: metadata.TableReader) {
      this.def.attributes = reader.readInt();
      this.name = reader.readString();
      this.namespace = reader.readString();
      this.extends_ = reader.readTypeDefOrRef();

      this.fieldList = reader.readFieldTableIndex();
      this.methodList = reader.readMethodDefTableIndex();
    }

    complete(reader: metadata.TableCompletionReader, nextTypeDef?: TypeDef) {

      this.def.name = reader.readString(this.name);
      this.def.namespace = reader.readString(this.namespace);
      this.def.baseType = reader.lookupTypeDefOrRef(this.extends_);
      
      var nextFieldList: number;
      if (nextTypeDef)
        nextFieldList = nextTypeDef.fieldList;
      reader.copyFieldRange(this.def.fields, this.fieldList, nextFieldList, this.def);

      var nextMethodList: number;
      if (nextTypeDef)
        nextMethodList = nextTypeDef.methodList;
      reader.copyMethodRange(this.def.methods, this.methodList, nextMethodList, this.def);
    }
  }

}