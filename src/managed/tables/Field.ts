module pe.managed.tables {

  /** ECMA-335 II.22.15 */
  export class Field {

    def = new managed.FieldInfo();

    name: number = 0;
    signature: number = 0;

    read(reader: metadata.TableReader) {
      this.def.attributes = reader.readShort();
      this.name = reader.readString();
      this.signature = reader.readBlobIndex();
    }

    complete(reader: metadata.TableCompletionReader) {
      this.def.name = reader.readString(this.name);
      reader.readFieldSignature(this.def, this.signature);
    }
  }

}