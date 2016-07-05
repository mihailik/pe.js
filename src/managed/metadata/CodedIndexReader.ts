module pe.managed.metadata {

  export class CodedIndexReader {
    tableKindBitCount: number;
    rowIndexBitCount: number;
    isShortForm: boolean;

    constructor(public tables: any[][], public tableKinds: number[]) {
      this.tableKindBitCount = calcRequredBitCount(tableKinds.length - 1);

      var maxTableLength = 0;
      for (var i = 0; i < tableKinds.length; i++) {
        var t = tables[tableKinds[i]];
        var tableLength = t ? t.length : 0;
        if (tableLength > maxTableLength)
          maxTableLength = tableLength;
      }

      this.rowIndexBitCount = calcRequredBitCount(maxTableLength);

      this.isShortForm = this.tableKindBitCount + this.rowIndexBitCount <= 16;
    }

    readCodedIndex(reader: io.BufferReader): number {
      return this.isShortForm ? reader.readShort() : reader.readInt();
    }

    lookup(codedIndex: number): any {
      var rowIndex = codedIndex >> this.tableKindBitCount;
      if (rowIndex === 0)
        return null;

      var tableKindIndex = codedIndex - (rowIndex << this.tableKindBitCount);
      var tableKind = this.tableKinds[tableKindIndex];

      var table: any[] = this.tables[tableKind];
      if (!table)
        return null; // TODO: why?

      var row = table[rowIndex - 1];
      if (!row)
        return null; // TODO: why??

      var result = row.def;

      return result;
    }
  }

}