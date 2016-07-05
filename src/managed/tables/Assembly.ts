declare var jsSHA: any;

module pe.managed.tables {

  /** ECMA-335 II.22.2 */
  export class Assembly {

    def: managed.Assembly = null;

    hashAlgId: metadata.AssemblyHashAlgorithm = 0;
    majorVersion: number = 0;
    minorVersion: number = 0;
    buildNumber: number = 0;
    revisionNumber: number = 0;
    flags: metadata.AssemblyFlags = 0;
    publicKey: number = 0;
    name: number = 0;
    culture: number = 0;

    read(reader: metadata.TableReader) {
      this.hashAlgId = reader.readInt();
      this.majorVersion = reader.readShort();
      this.minorVersion = reader.readShort();
      this.buildNumber = reader.readShort();
      this.revisionNumber = reader.readShort();
      this.flags = reader.readInt();
      this.publicKey = reader.readBlobIndex();
      this.name = reader.readString();
      this.culture = reader.readString();
    }

    precomplete(reader: metadata.TableCompletionReader) {
      var name = reader.readString(this.name);
      var culture = reader.readString(this.culture);
      var version = this.majorVersion + '.' + this.minorVersion + '.' + this.buildNumber + '.' + this.revisionNumber;
      var pk = reader.readPublicKey(this.publicKey);
      var pktoken = pk && pk.length ? this._hashPublicKey(pk) : null;

      this.def = reader.resolveAssemblyRef(name, version, pktoken, culture);
      this.def.isSpeculative = false;
      this.def.name = name;
      this.def.version = version;
      this.def.publicKey = pk;
      this.def.publicKeyToken = pktoken;
    }

  	private _hashPublicKey(pk: number[]): string {
      var algo: string;

      switch (this.hashAlgId) {
        case pe.managed.metadata.AssemblyHashAlgorithm.MD5:
          if (typeof console!=='undefined' && console && typeof console.error==='function')
            console.error('Assembly hashing using MD5 is not currently supported');
          break;

        case pe.managed.metadata.AssemblyHashAlgorithm.SHA1:
          algo = 'SHA-1';
          break;

        case pe.managed.metadata.AssemblyHashAlgorithm.SHA384:
          algo = 'SHA-384';
          break;

        case pe.managed.metadata.AssemblyHashAlgorithm.SHA512:
          algo = 'SHA-512';
          break;

        case pe.managed.metadata.AssemblyHashAlgorithm.None:
          break;

        default:
          throw new Error('Assembly hashing using unknown '+this.hashAlgId+' algorithm is not supported.');

      }

      if (algo) {
        var bytes = '';
        for (var i = 0; i < pk.length; i++) {
          bytes += String.fromCharCode(pk[i]);
        }
        var shaObj = new jsSHA(algo, 'BYTES');
        shaObj.update(bytes);
        var hash = shaObj.getHash('BYTES');

        var result = "";
        // reverse and take no more than 8 bytes for the token
        for (var i = 0; i < hash.length && i < 8; i++) {
          var hex = hash.charCodeAt(hash.length - i - 1).toString(16);
          if (hex.length == 1)
            result += "0";
          result += hex;
        }

        return result;
      }
      else {
      	hash = pk;
        var result = "";
        for (var i = 0; i < hash.length; i++) {
          var hex = hash[i].toString(16);
          if (hex.length == 1)
            result += "0";
          result += hex;
        }

        return result;
      }
    }
  }

}