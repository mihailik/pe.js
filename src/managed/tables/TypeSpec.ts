module pe.managed.tables {

  /** ECMA-335 II.22.39 */
  export class TypeSpec {

    def = new managed.Type();

    signature: number = 0;

    read(reader: metadata.TableReader) {
      this.signature = reader.readBlobIndex();

      // TODO: populate correctly
      var fakeType = new managed.Type();
      fakeType.name = 'fake*' + this.signature + '*';
      this.def.genericPrototype = fakeType;
    }
  
    complete(reader: metadata.TableCompletionReader) {
    }

  }

}