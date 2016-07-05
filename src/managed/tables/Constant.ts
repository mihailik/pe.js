module pe.managed.tables {

  /** ECMA-335 II.22.9 */
  export class Constant {
    TableKind = 0x0B;

    type: number = 0;
    parent: number = 0;
    value: number = 0;

    read(reader: metadata.TableReader) {
      this.type = reader.readByte();
      var padding = reader.readByte();
      this.parent = reader.readHasConstant();
      this.value = reader.readBlobIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var parentDef = reader.lookupHasConstant(this.parent);
      // TODO: apply constant to parentDef
    }

  }

}