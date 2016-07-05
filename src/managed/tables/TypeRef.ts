module pe.managed.tables {

  /** ECMA-335 II.22.38 */
  export class TypeRef {

    def: Type = null;

    resolutionScope: number = 0;
    name: number = 0;
    namespace: number = 0;

    read(reader: metadata.TableReader) {
      this.resolutionScope = reader.readResolutionScope();
      this.name = reader.readString();
      this.namespace = reader.readString();
    }

    precomplete(reader: metadata.TableCompletionReader) {
      var scope = reader.lookupResolutionScope(this.resolutionScope);
      var name = reader.readString(this.name);
      var namespace = reader.readString(this.namespace);

      this.def = reader.resolveTypeRef(scope, namespace, name);
    }

  }

}