module pe.managed.tables {

  /** ECMA-335 II.22.36 */
  export class StandAloneSig {

    signature: number = 0;

    read(reader: metadata.TableReader) {
      this.signature = reader.readBlobIndex();
    }
  }

}