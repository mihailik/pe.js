module pe.managed.tables {

  /** ECMA-335 II.22.7 */
  export class AssemblyRefProcessor {
    TableKind = 0x24;

    processor: number;

    read(reader: metadata.TableReader) {
      this.processor = reader.readInt();
    }
  }

}