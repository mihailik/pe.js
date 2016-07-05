module pe.managed {

  export class AppDomain {
    assemblies: Assembly[] = [];
    mscorlib: Assembly = new Assembly();

    unresolvedAssemblies: Assembly[] = [];

    constructor() {
      this.mscorlib.name = "mscorlib";

      var objectType = new Type(null, this.mscorlib, "System", "Object")
      var valueType = new Type(objectType, this.mscorlib, "System", "ValueType");
      var enumType = new Type(valueType, this.mscorlib, "System", "Enum");

      this.mscorlib.types.push(
        new Type(valueType, this.mscorlib, "System", "Void"),
        new Type(valueType, this.mscorlib, "System", "Boolean"),
        new Type(valueType, this.mscorlib, "System", "Char"),
        new Type(valueType, this.mscorlib, "System", "SByte"),
        new Type(valueType, this.mscorlib, "System", "Byte"),
        new Type(valueType, this.mscorlib, "System", "Int16"),
        new Type(valueType, this.mscorlib, "System", "UInt16"),
        new Type(valueType, this.mscorlib, "System", "Int32"),
        new Type(valueType, this.mscorlib, "System", "UInt32"),
        new Type(valueType, this.mscorlib, "System", "Int64"),
        new Type(valueType, this.mscorlib, "System", "UInt64"),
        new Type(valueType, this.mscorlib, "System", "Single"),
        new Type(valueType, this.mscorlib, "System", "Double"),
        new Type(valueType, this.mscorlib, "System", "String"),
        new Type(objectType, this.mscorlib, "System", "TypedReference"),
        new Type(valueType, this.mscorlib, "System", "IntPtr"),
        new Type(valueType, this.mscorlib, "System", "UIntPtr"),
        objectType,
        valueType,
        enumType,
        new Type(objectType, this.mscorlib, "System", "Type"))

      this.assemblies.push(this.mscorlib);
    }

    read(reader: io.BufferReader, async?: AsyncCallback<Assembly>): Assembly {
      var context = new AssemblyReading(this, reader, async);
      var result = context.read();

      if (result) {
        /*
        this.assemblies.push(result);
        for (var i = 0; i < context..length; i++) {
          this.unresolvedAssemblies.push(context.unresolvedAssemblies[i]);
        }*/
      }

      return result;
    }

    resolveAssembly(
      name: string,
      version: string,
      publicKeyToken: string,
      culture: string) {
      var asm: Assembly;
      for (var i = 0; i < this.assemblies.length; i++) {
        var asm = this.assemblies[i];
        if ((asm.name && name && asm.name.toLowerCase() === name.toLowerCase())
          || (!asm.name && !name)) {
          // TODO: deal with public key signature
          if (asm.isSpeculative) {
            if (version)
            	asm.version = version;
            if (publicKeyToken)
            	asm.publicKeyToken = publicKeyToken;
            if (culture)
              asm.culture = culture;
          }
          return asm;
        }
      }

      // Short-cirquit mscorlib, because we create a speculative one at init time
      if (name && name.toLowerCase() === "mscorlib"
        && this.assemblies[0].isSpeculative)
        return this.assemblies[0];

      asm = new Assembly();
      asm.name = name;
      asm.version = version;
      asm.publicKeyToken = publicKeyToken;
      asm.culture = culture;
      return asm;
    }
  }


  class AssemblyReading {
    fileHeaders: headers.PEFileHeaders = null;
    clrDirectory: metadata.ClrDirectory = null;
    clrMetadata: metadata.ClrMetadata = null;
    metadataStreams: metadata.MetadataStreams = null;
    tableStream: metadata.TableStream = null;

    private _stage = 0;

    constructor(
      public appDomain: AppDomain,
      private _reader: io.BufferReader,
      private _async: AsyncCallback<Assembly>) {
    }

    read(): Assembly {

      var stageCount = 0;

      switch (this._stage) {
        case 0:
          this._reader.offset = 0;
          this.readFileHeaders();
          if (this._progressContinueLater()) return;

        case 1:
          this.readClrDirectory();
          if (this._progressContinueLater()) return;

        case 2:
          this.readClrMetadata();
          if (this._progressContinueLater()) return;

        case 3:
          this.readMetadataStreams();
          if (this._progressContinueLater()) return;

        case 4:
          this.readTableStream();
          if (this._progressContinueLater()) return;

        case 5:
          this.populateStrings(this.tableStream.stringIndices);
          if (this._progressContinueLater()) return;

        case 6:
          var mscorlib = this._getMscorlibIfThisShouldBeOne();
          if (mscorlib)
            this.tableStream.tables[metadata.TableKind.Assembly][0].def = mscorlib;
          if (this._progressContinueLater()) return;

        case 7:
          this.completeTables();
          if (this._progressContinueLater()) return;

        case 8:
          var result = this._createAssemblyFromTables();
          result.fileHeaders = this.fileHeaders;
          if (this._async)
            this._async(null, result);
          else
            return result;
      }
    }

    private _progressContinueLater() {
      this._stage++;
      if (this._async && this._async.progress) {
        var continueLater = this._async.progress(this._stage, 9);
        if (continueLater) {
          continueLater(() => this.read());
          return true;
        }
      }

      return false;
    }

    private _createAssemblyFromTables() {
      var assemblyTable = this.tableStream.tables[metadata.TableKind.Assembly];
      var assemblyRow = assemblyTable[0];
      var assembly: Assembly = assemblyRow.def;

      var typeDefTable = this.tableStream.tables[metadata.TableKind.TypeDef];
      if (typeDefTable)
        assembly.types = typeDefTable.map(t => t.def);

      assembly.runtimeVersion = this.clrDirectory.runtimeVersion;
      assembly.imageFlags = this.clrDirectory.imageFlags;
      assembly.specificRuntimeVersion = this.clrMetadata.runtimeVersion;
      assembly.metadataVersion = this.clrMetadata.metadataVersion;
      assembly.tableStreamVersion = this.tableStream.version;

      var moduleTable = this.tableStream.tables[metadata.TableKind.Module];
      if (moduleTable && moduleTable.length) {
        var moduleRow: tables.Module = moduleTable[0];
        //moduleRow.
      }

      return assembly;
    }

    private _getMscorlibIfThisShouldBeOne(): Assembly {
      var stringIndices = this.tableStream.stringIndices;

      var assemblyTable = this.tableStream.tables[0x20]; // Assembly
      if (!assemblyTable || !assemblyTable.length)
        return null;

      var assemblyRow: tables.Assembly = assemblyTable[0];
      var simpleAssemblyName = stringIndices[assemblyRow.name];
      if (!simpleAssemblyName
        || simpleAssemblyName.toLowerCase() !== "mscorlib")
        return null;

      if (!this.appDomain.assemblies[0].isSpeculative)
        return null; // mscorlib is already populated, no more guessing

      var typeDefTable: tables.TypeDef[] = this.tableStream.tables[0x02]; // 0x02
      if (!typeDefTable)
        return null;

      var containsSystemObject = false;
      var containsSystemString = false;

      for (var i = 0; i < typeDefTable.length; i++) {
        var typeDefRow = typeDefTable[i];

        var name = stringIndices[typeDefRow.name];
        var namespace = stringIndices[typeDefRow.namespace];

        if (namespace !== "System")
          continue;

        if (name === "Object")
          containsSystemObject = true;
        else if (name === "String")
          containsSystemString = true;
      }

      if (containsSystemObject && containsSystemString)
        return this.appDomain.assemblies[0];
      else
        return null;
    }

    private _readBlobHex(blobIndex: number): string {
      var saveOffset = this._reader.offset;

      this._reader.setVirtualOffset(this.metadataStreams.blobs.address);

      this._reader.setVirtualOffset(this.metadataStreams.blobs.address + blobIndex);
      var length = this._readBlobSize();

      var result = "";
      for (var i = 0; i < length; i++) {
        var hex = this._reader.readByte().toString(16);
        if (hex.length == 1)
          result += "0";
        result += hex;
      }

      this._reader.offset = saveOffset;

      return result.toUpperCase();
    }

    private _readBlobBytes(blobIndex: number): number[] {
      var saveOffset = this._reader.offset;

      this._reader.setVirtualOffset(this.metadataStreams.blobs.address);

      this._reader.setVirtualOffset(this.metadataStreams.blobs.address + blobIndex);
      var length = this._readBlobSize();

      var result: number[] = [];
      for (var i = 0; i < length; i++) {
        var b = this._reader.readByte();
        result.push(b);
      }

      this._reader.offset = saveOffset;

      return result;
    }

    private _readBlobSize(): number {
      var length;
      var b0 = this._reader.readByte();
      if (b0 < 0x80) {
        length = b0;
      }
      else {
        var b1 = this._reader.readByte();

        if ((b0 & 0xC0) == 0x80) {
          length = ((b0 & 0x3F) << 8) + b1;
        }
        else {
          var b2 = this._reader.readByte();
          var b3 = this._reader.readByte();
          length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
        }
      }

      return length;
    }

    readFileHeaders() {
      this.fileHeaders = new headers.PEFileHeaders();
      this.fileHeaders.read(this._reader);

      this._reader.sections = this.fileHeaders.sectionHeaders;
    }

    readClrDirectory() {
      var clrDataDirectory = this.fileHeaders.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr];

      this._reader.setVirtualOffset(clrDataDirectory.address);
      this.clrDirectory = new metadata.ClrDirectory();
      this.clrDirectory.read(this._reader);
    }

    readClrMetadata() {
      this._reader.setVirtualOffset(this.clrDirectory.metadataDir.address);

      this.clrMetadata = new metadata.ClrMetadata();
      this.clrMetadata.read(this._reader);
    }

    readMetadataStreams() {
      this.metadataStreams = new metadata.MetadataStreams();
      this.metadataStreams.read(
        this.clrDirectory.metadataDir.address,
        this.clrMetadata.streamCount,
        this._reader);
    }

    readTableStream() {
      this.tableStream = new metadata.TableStream();
      this.tableStream.read(
        this._reader,
        this.metadataStreams.strings.size,
        this.metadataStreams.guids.length,
        this.metadataStreams.blobs.size);
    }

    populateStrings(stringIndices: string[]) {
      var saveOffset = this._reader.offset;

      stringIndices[0] = null;
      for (var i in stringIndices) {
        if (<any>i > 0) {
          var iNum = Number(i);
          this._reader.setVirtualOffset(this.metadataStreams.strings.address + iNum);
          stringIndices[iNum] = this._reader.readUtf8Z(1024 * 1024 * 1024);
        }
      }
    }

    completeTables() {

      var completionReader = new metadata.TableCompletionReader(
        this.appDomain,
        this.tableStream, this.metadataStreams,
        this.tableStream.codedIndexReaders,
        blobIndex => this._readBlobBytes(blobIndex));

      for (var iTab = 0; iTab < this.tableStream.tables.length; iTab++) {
        var table = this.tableStream.tables[iTab];
        if (!table || !table.length || !table[0].precomplete) continue;

        for (var i = 0; i < table.length; i++) {
          var row = table[i];
          var nextRow = i + 1 < table.length ? table[i + 1] : null;

          row.precomplete(completionReader, nextRow);
        }

      }


      for (var iTab = 0; iTab < this.tableStream.tables.length; iTab++) {
        var table = this.tableStream.tables[iTab];
        if (!table || !table.length || !table[0].complete) continue;

        for (var i = 0; i < table.length; i++) {
          var row = table[i];
          var nextRow = i + 1 < table.length ? table[i + 1] : null;

          row.complete(completionReader, nextRow);
        }

      }
    }
  }

}