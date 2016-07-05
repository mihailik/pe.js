module pe.managed.tables {

  /** ECMA-335 II.22.3 */
  export class AssemblyOS {
    TableKind = 0x22;

    osPlatformId: number = 0;
    osMajorVersion: number = 0;
    osMinorVersion: number = 0;

    read(reader: metadata.TableReader) {
      this.osPlatformId = reader.readInt();
      this.osMajorVersion = reader.readShort();
      this.osMinorVersion = reader.readShort();
    }
  }

}