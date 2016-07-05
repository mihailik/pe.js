module pe.managed.tables {

  /** ECMA-335 II.22.24 */
  export class ManifestResource {

    offset: number = 0;
    flags: metadata.ManifestResourceAttributes = 0;
    name: number = 0;
    implementation: number = 0;

    read(reader: metadata.TableReader) {
      this.offset = reader.readInt();
      this.flags = reader.readInt();
      this.name = reader.readString();
      this.implementation = reader.readImplementation();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var implementation = reader.lookupImplementation(this.implementation);
      // TODO: store resources somehwere??
    }

  }

}