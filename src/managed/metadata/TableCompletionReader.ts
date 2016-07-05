module pe.managed.metadata {

  export class TableCompletionReader {
    constructor(
      private _appDomain: AppDomain,
      private _tableStream: TableStream,
      private _metadataStreams: MetadataStreams,
      private _codedIndexReaders: CodedIndexReaders,
      public readPublicKey: (blobIndex: number) => number[]) {
    }

    readString(index: number): string {
      return this._tableStream.stringIndices[index];
    }

    readGuid(index: number): string {
      return this._metadataStreams.guids[index];
    }

    copyFieldRange(fields: FieldInfo[], start: number, end?: number, owner?: Type) {
      this._copyDefRange(fields, TableKind.Field, start, end, owner);
    }

    copyMethodRange(methods: MethodInfo[], start: number, end?: number, owner?: Type) {
      this._copyDefRange(methods, TableKind.MethodDef, start, end, owner);
    }

    copyParamRange(parameters: ParameterInfo[], start: number, end: number, owner?: MethodInfo) {
      this._copyDefRange(parameters, TableKind.Param, start, end, owner);
    }

    private _copyDefRange(defs: any[], tableKind: TableKind, start: number, end?: number, owner?: any) {
      var table = this._tableStream.tables[tableKind];

      if (!end && typeof end === "undefined")
        end = table.length + 1;

      var setOwner = typeof owner !== 'undefined';
      for (var i = start - 1; i < end - 1; i++) {
        var row = table[i];
        if (setOwner)
          row.def.owner = owner;
        defs.push(row.def);
      }
    }


    lookupTable(tableKind: TableKind, tableIndex: number) {
      if (tableIndex == 0)
        return null;

      var table = this._tableStream.tables[tableKind];
      if (!table)
        return null;
      else
        return table[tableIndex - 1];
    }

    lookupResolutionScope(codedIndex: number): any { return this._codedIndexReaders.resolutionScope.lookup(codedIndex); }
    lookupTypeDefOrRef(codedIndex: number): Type { return this._codedIndexReaders.typeDefOrRef.lookup(codedIndex); }
    lookupHasConstant(codedIndex: number): any { return this._codedIndexReaders.hasConstant.lookup(codedIndex); }
    lookupHasCustomAttribute(codedIndex: number): any { return this._codedIndexReaders.hasCustomAttribute.lookup(codedIndex); }
    lookupCustomAttributeType(codedIndex: number): any { return this._codedIndexReaders.customAttributeType.lookup(codedIndex); }
    lookupHasDeclSecurity(codedIndex: number): any { return this._codedIndexReaders.hasDeclSecurity.lookup(codedIndex); }
    lookupImplementation(codedIndex: number): any { return this._codedIndexReaders.implementation.lookup(codedIndex); }
    lookupHasFieldMarshal(codedIndex: number): any { return this._codedIndexReaders.hasFieldMarshal.lookup(codedIndex); }
    lookupTypeOrMethodDef(codedIndex: number): any { return this._codedIndexReaders.typeOrMethodDef.lookup(codedIndex); }
    lookupMemberForwarded(codedIndex: number): any { return this._codedIndexReaders.memberForwarded.lookup(codedIndex); }
    lookupMemberRefParent(codedIndex: number): any { return this._codedIndexReaders.memberRefParent.lookup(codedIndex); }
    lookupMethodDefOrRef(codedIndex: number): any { return this._codedIndexReaders.methodDefOrRef.lookup(codedIndex); }
    lookupHasSemantics(codedIndex: number): any { return this._codedIndexReaders.hasSemantics.lookup(codedIndex); }

    resolveAssemblyRef(
      name: string,
      version: string,
      publicKeyOrToken: string,
      culture: string): managed.Assembly {

      return this._appDomain.resolveAssembly(name, version, publicKeyOrToken, culture);

    }

    resolveTypeRef(scope: any, namespace: string, name: string): managed.Type {

      if (!(scope instanceof managed.Assembly)) { // no multimodule assembly handling yet
        var type = new managed.Type();
        type.namespace = namespace;
        type.name = name;
        return type;
      }


      var asm = <managed.Assembly>scope;

      for (var i = 0; asm.types.length; i++) {
        var t = asm.types[i];
        if (t.name === name && t.namespace === namespace)
          return t;
      }

      var type = new managed.Type();
      type.namespace = namespace;
      type.name = name;

      if (asm.isSpeculative) { // if actual assembly has no such type, don't inject
        asm.types.push(type);
      }

      return type;
    }

    readFieldSignature(field: FieldInfo, blobIndex: number) {
    }
  }

}