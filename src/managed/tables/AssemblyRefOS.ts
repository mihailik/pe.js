module pe.managed.tables {

  /** ECMA-335 II.2.6 */
  export class AssemblyRefOs {
    TableKind = 0x25;

    osPlatformId: number = 0;
    osMajorVersion: number = 0;
    osMinorVersion: number = 0;
    assemblyRef: number = 0;

    read(reader: metadata.TableReader) {
      this.osPlatformId = reader.readInt();
      this.osMajorVersion = reader.readInt();
      this.osMinorVersion = reader.readInt();
      this.assemblyRef = reader.readAssemblyTableIndex();
    }
  }

}