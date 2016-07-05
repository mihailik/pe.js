module pe.managed.tables {

  /** ECMA-335 II.22.34 */
  export class Property {

    def = new managed.PropertyInfo();

    name: number = 0;
    type: number = 0;

    read(reader: metadata.TableReader) {
      this.def.attributes = reader.readShort();
      this.name = reader.readString();
      this.type = reader.readBlobIndex();
    }

    complete(reader: metadata.TableCompletionReader) {
      this.def.name = reader.readString(this.name);
      //this.def.propertyType = reader.
    }
  }

}