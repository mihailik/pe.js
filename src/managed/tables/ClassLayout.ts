module pe.managed.tables {

  /** ECMA-335 II.22.8 */
  export class ClassLayout {
    TableKind = 0x0F;

    packingSize: number = 0;
    classSize: number = 0;
    parent: number = 0;

    read(reader: metadata.TableReader) {
      this.packingSize = reader.readShort();
      this.classSize = reader.readInt();
      this.parent = reader.readTypeDefTableIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var typeDef = <TypeDef>reader.lookupTable(metadata.TableKind.TypeDef, this.parent);
      if (typeDef)
        typeDef.def.layout = { packingSize: this.packingSize, classSize: this.classSize };
    }

  }

}