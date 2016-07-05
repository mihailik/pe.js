module pe.unmanaged {


  export class DllImport {
    name: string = "";
    ordinal: number = 0;
    dllName: string = "";
    timeDateStamp: Date = new Date(0);

    static read(reader: io.BufferReader, result?: DllImport[]): DllImport[] {
      if (!result)
              result = [];

      var readLength = 0;
      while (true) {

        var originalFirstThunk = reader.readInt();
        var timeDateStamp = new Date(0);
        timeDateStamp.setTime(reader.readInt());

        var forwarderChain = reader.readInt();
        var nameRva = reader.readInt();
        var firstThunk = reader.readInt();

        var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
        if (thunkAddressPosition == 0)
          break;

        var saveOffset = reader.offset;

        var libraryName;
        if (nameRva === 0) {
          libraryName = null;
        }
        else {
          reader.setVirtualOffset(nameRva);
          libraryName = reader.readAsciiZ();
        }

        reader.setVirtualOffset(thunkAddressPosition);

        while (true) {
          var newEntry = result[readLength];
          if (!newEntry) {
            newEntry = new DllImport();
            result[readLength] = newEntry;
          }

          if (!newEntry.readEntry(reader))
            break;

          newEntry.dllName = libraryName;
          newEntry.timeDateStamp = timeDateStamp;
          readLength++;
        }

        reader.offset = saveOffset;
      }

      result.length = readLength;

      return result;
    }

    private readEntry(reader: io.BufferReader): boolean {
      var importPosition = reader.readInt();
      if (importPosition == 0)
        return false;

      if (importPosition & (1 << 31)) {
        this.ordinal = importPosition & 0x7FFFFFFF;
        this.name = null;
      }
      else {
        var saveOffset = reader.offset;
        reader.setVirtualOffset(importPosition);

        var hint = reader.readShort();
        var fname = reader.readAsciiZ();

        this.ordinal = hint;
        this.name = fname;

        reader.offset = saveOffset;
      }

      return true;
    }
  }
}