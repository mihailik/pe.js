module pe.managed.tables {

  /** ECMA-335 II.22.22 */
  export class ImplMap {
    TableKind = 0x1C;

    mappingFlags: metadata.PInvokeAttributes = 0;
    memberForwarded: number = 0;
    importName: number = 0;
    importScope: number = 0;

    read(reader: metadata.TableReader) {
      this.mappingFlags = reader.readShort();
      this.memberForwarded = reader.readMemberForwarded();
      this.importName = reader.readString();
      this.importScope = reader.readModuleRefTableIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var forwarded = reader.lookupMemberForwarded(this.memberForwarded);
      var moduleRef = reader.lookupTable(metadata.TableKind.ModuleRef, this.importScope);
      // TODO: resolve dllimport
    }
  }

}