module pe.managed.metadata {

  export class TableStream {
    reserved0: number = 0;
    version: string = "";

    // byte
    heapSizes: number = 0;

    reserved1: number = 0;

    tables: any[][] = [];
    stringIndices: string[] = [];

    codedIndexReaders: CodedIndexReaders = null;

    read(reader: io.BufferReader, stringCount: number, guidCount: number, blobCount: number) {
      this.reserved0 = reader.readInt();

      // Note those are bytes, not shorts!
      this.version = reader.readByte() + "." + reader.readByte();

      this.heapSizes = reader.readByte();
      this.reserved1 = reader.readByte();

      var valid = reader.readLong();
      var sorted = reader.readLong();

      var tableCounts = this._readTableRowCounts(valid, reader);

      this._populateTableRows(tableCounts);

      this.codedIndexReaders = new CodedIndexReaders(this.tables);

      var tableReader = new TableReader(reader, this.tables, stringCount, guidCount, blobCount, this.codedIndexReaders);
      this._readTableRows(tableCounts, tableReader);

      this.stringIndices = tableReader.stringIndices;
    }

    private _readTableRowCounts(valid: Long, tableReader: io.BufferReader) {
      var tableCounts: number[] = [];

      var bits = valid.lo;
      for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
        if (bits & 1) {
          var rowCount = tableReader.readInt();
          tableCounts[tableIndex] = rowCount;
        }
        bits = bits >> 1;
      }

      bits = valid.hi;
      for (var i = 0; i < 32; i++) {
        var tableIndex = i + 32;
        if (bits & 1) {
          var rowCount = tableReader.readInt();
          tableCounts[tableIndex] = rowCount;
        }
        bits = bits >> 1;
      }

      return tableCounts;
    }

    private _populateTableObjects(table: any[], Ctor: any, count: number) {
      for (var i = 0; i < count; i++) {
        table.push(new Ctor());
      }
    }

    private _populateTableRows(tableCounts: number[]) {
      for (var i = 0; i < tableCounts.length; i++) {
        var table = [];
        this.tables[i] = table;
        var tableName = TableKind[i];
        var TableType = tables[tableName];

        if (typeof (TableType) === "undefined") {
          if (tableCounts[i])
            throw new Error("Table 0x" + i.toString(16).toUpperCase() + " has " + tableCounts[i] + " rows but no definition.");
          continue;
        }

        this._populateTableObjects(table, TableType, tableCounts[i]);
      }
    }

    private _readTableRows(tableCounts: number[], reader: TableReader) {
      for (var i = 0; i < tableCounts.length; i++) {
        var table = this.tables[i];
        var tableName = TableKind[i];
        var TableType = tables[tableName];

        for (var iRow = 0; iRow < tableCounts[i]; iRow++) {
          table[iRow].read(reader);
        }
      }
    }
  }

}