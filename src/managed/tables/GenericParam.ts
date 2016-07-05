module pe.managed.tables {

  /** ECMA-335 II.22.20 */
  export class GenericParam {
    TableKind = 0x2A;

    def = new Type();
    
    number_: number = 0;
    owner: number = 0;
    name: number = 0;

    read(reader: metadata.TableReader) {
      this.number_ = reader.readShort();
      this.def.attributes = reader.readShort();
      this.owner = reader.readTypeOrMethodDef();
      this.name = reader.readString();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      this.def.genericPrototype = reader.lookupTypeDefOrRef(this.owner);
      this.def.name = reader.readString(this.name);

      if (this.def.genericPrototype && (<Type>this.def.genericPrototype).genericArguments) {
        (<Type>this.def.genericPrototype).genericArguments[this.number_] = this.def;
      }
    }
  }

}