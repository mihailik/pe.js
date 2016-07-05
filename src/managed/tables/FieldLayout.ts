module pe.managed.tables {

  /** ECMA-335 II.22.8 */
  export class FieldLayout {
    TableKind = 0x10;

    offset: number = 0;
    field: number = 0;

    read(reader: metadata.TableReader) {
      this.offset = reader.readInt();
      this.field = reader.readFieldTableIndex();
    }

    complete(reader: metadata.TableCompletionReader) {
      var field = reader.lookupTable(metadata.TableKind.Field, this.field);
      if (field)
        field.fieldOffset = this.offset;
    }
  }

}