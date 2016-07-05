module pe.managed.metadata {

  export class TableReader {

    stringIndices: string[] = [];


    constructor(
      private _reader: io.BufferReader,
      private _tables: any[][],
      stringCount: number,
      guidCount: number,
      blobCount: number,
      private _codedIndexReaders: CodedIndexReaders) {
      this.readStringIndex = this._getDirectReader(stringCount);
      this.readGuid = this._getDirectReader(guidCount);
      this.readBlobIndex = this._getDirectReader(blobCount);

      this.readGenericParamTableIndex = this._getTableIndexReader(TableKind.GenericParam);
      this.readParamTableIndex = this._getTableIndexReader(TableKind.Param);
      this.readFieldTableIndex = this._getTableIndexReader(TableKind.Field);
      this.readMethodDefTableIndex = this._getTableIndexReader(TableKind.MethodDef);
      this.readTypeDefTableIndex = this._getTableIndexReader(TableKind.TypeDef);
      this.readEventTableIndex = this._getTableIndexReader(TableKind.Event);
      this.readPropertyTableIndex = this._getTableIndexReader(TableKind.Property);
      this.readModuleRefTableIndex = this._getTableIndexReader(TableKind.ModuleRef);
      this.readAssemblyTableIndex = this._getTableIndexReader(TableKind.Assembly);
    }

    private readStringIndex: () => number;

    readString() {
      var index = this.readStringIndex();
      this.stringIndices[index] = "";

      return index;
    }

    private _getDirectReader(spaceSize: number): any {
      return spaceSize > 65535 ? this.readInt : this.readShort;
    }

    private _getTableIndexReader(tableKind: number) {
      var table = this._tables[tableKind];
      return this._getDirectReader(table ? table.length : 0);
    }

    private _getCodedIndexReader(tables: number[]) {
      var maxTableLength = 0;
      for (var i = 0; i < tables.length; i++) {
        var tableIndex = tables[i];
        var table = this._tables[tableIndex];
        maxTableLength = Math.max(maxTableLength, table ? table.length : 0);
      }

      var tableKindBitCount = calcRequredBitCount(tables.length - 1);
      var tableIndexBitCount = calcRequredBitCount(maxTableLength);

      var totalBitCount = tableKindBitCount + tableIndexBitCount;
      return totalBitCount <= 16 ?
        this.readShort :
        this.readInt;
    }

    readByte(): number { return this._reader.readByte(); }
    readShort(): number { return this._reader.readShort(); }
    readInt(): number { return this._reader.readInt(); }

    readGuid: () => number;

    readResolutionScope() { return this._codedIndexReaders.resolutionScope.readCodedIndex(this._reader); }
    readTypeDefOrRef() { return this._codedIndexReaders.typeDefOrRef.readCodedIndex(this._reader); }
    readHasConstant() { return this._codedIndexReaders.hasConstant.readCodedIndex(this._reader); }
    readHasCustomAttribute() { return this._codedIndexReaders.hasCustomAttribute.readCodedIndex(this._reader); }
    readCustomAttributeType() { return this._codedIndexReaders.customAttributeType.readCodedIndex(this._reader); }
    readHasDeclSecurity() { return this._codedIndexReaders.hasDeclSecurity.readCodedIndex(this._reader); }
    readImplementation() { return this._codedIndexReaders.implementation.readCodedIndex(this._reader); }
    readHasFieldMarshal() { return this._codedIndexReaders.hasFieldMarshal.readCodedIndex(this._reader); }
    readTypeOrMethodDef() { return this._codedIndexReaders.typeOrMethodDef.readCodedIndex(this._reader); }
    readMemberForwarded() { return this._codedIndexReaders.memberForwarded.readCodedIndex(this._reader); }
    readMemberRefParent() { return this._codedIndexReaders.memberRefParent.readCodedIndex(this._reader); }
    readMethodDefOrRef() { return this._codedIndexReaders.methodDefOrRef.readCodedIndex(this._reader); }
    readHasSemantics() { return this._codedIndexReaders.hasSemantics.readCodedIndex(this._reader); }

    readBlobIndex: () => number;

    readGenericParamTableIndex: () => number;
    readParamTableIndex: () => number;
    readFieldTableIndex: () => number;
    readMethodDefTableIndex: () => number;
    readTypeDefTableIndex: () => number;
    readEventTableIndex: () => number;
    readPropertyTableIndex: () => number;
    readModuleRefTableIndex: () => number;
    readAssemblyTableIndex: () => number;
  }

}