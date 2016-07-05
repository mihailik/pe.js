module pe.managed.tables {

  /** ECMA-335 II.22.11 */
  export class DeclSecurity {

    action: number = 0;
    parent: number = 0;
    permissionSet: number = 0;

    read(reader: metadata.TableReader) {
      this.action = reader.readShort();
      this.parent = reader.readHasDeclSecurity();
      this.permissionSet = reader.readBlobIndex();
    }

    complete(reader: metadata.TableCompletionReader) {
      var declSecurityParent = reader.lookupHasCustomAttribute(this.parent);
      if (declSecurityParent) {
        var declSecurityParentDef = declSecurityParent.def;
      }
    }
  }

}