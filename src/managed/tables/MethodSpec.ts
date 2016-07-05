module pe.managed.tables {

  /** ECMA-335 II.22.29 */
  export class MethodSpec {

    method: number = 0;
    instantiation: number = 0;

    read(reader: metadata.TableReader) {
      this.method = reader.readMethodDefOrRef();
      this.instantiation = reader.readBlobIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var method = reader.lookupMethodDefOrRef(this.method);

      // TODO: store that 'impl' stuff somewhere in the class?
    }

  }

}