module pe.managed.tables {

  /** ECMA-335 II.22.17 */
  export class FieldMarshal {
    TableKind = 0x0D;

    parent: number = 0;
    nativeType: number = 0;

    read(reader: metadata.TableReader) {
      this.parent = reader.readHasFieldMarshal();
      this.nativeType = reader.readBlobIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var parent = reader.lookupHasFieldMarshal(this.parent);
      // TODO: do some matching?
    }
  }

}