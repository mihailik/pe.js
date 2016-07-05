module pe.managed.tables {

  /** ECMA-335 II.22.31 */
  export class ModuleRef {

    name: number = 0;

    read(reader: metadata.TableReader) {
      this.name = reader.readString();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var name = reader.readString(this.name);
    }

  }

}