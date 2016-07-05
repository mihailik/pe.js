module pe.managed.tables {

  /** ECMA-335 II.22.14 */
  export class ExportedType {

    flags: metadata.TypeAttributes = 0;
    typeDefId: number = 0;
    typeName: number = 0;
    typeNamespace: number = 0;
    implementation: number = 0;

    read(reader: metadata.TableReader) {
      this.flags = reader.readInt();
      this.typeDefId = reader.readInt();
      this.typeName = reader.readString();
      this.typeNamespace = reader.readString();
      this.implementation = reader.readImplementation();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var impl = reader.lookupImplementation(this.implementation);
      // TODO: do something?
    }
  
  }

}