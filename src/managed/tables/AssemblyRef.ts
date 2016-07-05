module pe.managed.tables {

  /** ECMA-335 II.22.5 */
  export class AssemblyRef {

    def: managed.Assembly = null;

    majorVersion: number = 0;
    minorVersion: number = 0;
    buildNumber: number = 0;
    revisionNumber: number = 0;
    flags: metadata.AssemblyFlags = 0;
    publicKeyOrToken: number = 0;
    name: number = 0;
    culture: number = 0;
    hashValue: number = 0;
    
    read(reader: metadata.TableReader) {
      this.majorVersion = reader.readShort();
      this.minorVersion = reader.readShort();
      this.buildNumber = reader.readShort();
      this.revisionNumber = reader.readShort();
      this.flags = reader.readInt();
      this.publicKeyOrToken = reader.readBlobIndex();
      this.name = reader.readString();
      this.culture = reader.readString();
      this.hashValue = reader.readBlobIndex();
    }
  
    precomplete(reader: metadata.TableCompletionReader) {
      var name = reader.readString(this.name);
      var culture = reader.readString(this.culture);
      var version = this.majorVersion + '.' + this.minorVersion + '.' + this.buildNumber + '.' + this.revisionNumber;
      var pk = null; // reader.readPublicKey(this.publicKey);

      this.def = reader.resolveAssemblyRef(name, version, pk, culture);
    }

  }

}