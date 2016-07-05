module pe.managed.tables {

  /** ECMA-335 II.22.33 */
  export class Param {

    def = new managed.ParameterInfo();

    sequence: number = 0;
    name: number = 0;

    read(reader: metadata.TableReader) {
      this.def.attributes = reader.readShort();
      this.sequence = reader.readShort();
      this.name = reader.readString();
    }

    complete(reader: metadata.TableCompletionReader) {
      this.def.name = reader.readString(this.name);
    }
  }

}