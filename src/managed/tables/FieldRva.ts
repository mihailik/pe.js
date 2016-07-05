module pe.managed.tables {

  /** ECMA-335 II.22.18 */
  export class FieldRVA {
    TableKind = 0x1D;

    rva: number = 0;
    field: number = 0;

    read(reader: metadata.TableReader) {
      this.rva = reader.readInt();
      this.field = reader.readFieldTableIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var field = reader.lookupTable(metadata.TableKind.Field, this.field);
      // TODO: rva to what?
    }
  }

}