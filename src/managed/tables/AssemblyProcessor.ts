module pe.managed.tables {

  /** ECMA-335 II.22.4 */
  export class AssemblyProcessor {
    TableKind = 0x21;

    processor: number = 0;

    reader(reader: metadata.TableReader) {
      this.processor = reader.readInt();
    }
  }

}