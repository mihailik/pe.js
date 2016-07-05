module pe.managed.tables {

  /** ECMA-335 II.22.19 */
  export class File {
    TableKind = 0x26;

    flags: metadata.FileAttributes = 0;
    name: number = 0;
    hashValue: number = 0;

    read(reader: metadata.TableReader) {
      this.flags = reader.readInt();
      this.name = reader.readString();
      this.hashValue = reader.readBlobIndex();
    }
  }

}