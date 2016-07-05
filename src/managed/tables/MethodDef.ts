module pe.managed.tables {

  /** ECMA-335 II.22.26 */
  export class MethodDef {

    def = new MethodInfo();

    rva: number = 0;
    implAttributes: metadata.MethodImplAttributes = 0;
    attributes: metadata.MethodAttributes = 0;
    name: number = 0;
    signature: number = 0;
    paramList: number = 0;

    read(reader: metadata.TableReader) {
      this.rva = reader.readInt();
      this.implAttributes = reader.readShort();
      this.attributes = reader.readShort();
      this.name = reader.readString();
      this.signature = reader.readBlobIndex();
      this.paramList = reader.readParamTableIndex();
    }

    complete(reader: metadata.TableCompletionReader, nextMethodDef?: MethodDef) {
      this.def.attributes = this.attributes;
      this.def.name = reader.readString(this.name);

      var nextParamList: number;
      if (nextMethodDef)
        nextParamList = nextMethodDef.paramList;
      reader.copyParamRange(this.def.parameters, this.paramList, nextParamList, this.def);

    }
  }

}