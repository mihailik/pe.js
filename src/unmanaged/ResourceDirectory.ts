module pe.unmanaged {

  export class ResourceDirectory {

    /** Resource flags. This field is reserved for future use. It is currently set to zero. */
    characteristics: number = 0;

    /** The time that the resource data was created by the resource compiler. */
    timestamp: Date = new Date(0);

    /** The version number, set by the user. */
    version: string = "";

    subdirectories: ResourceDirectoryEntry[] = [];
    dataEntries: ResourceDataEntry[] = [];

    toString() {
      return "subdirectories[" + (this.subdirectories ? <any>this.subdirectories.length : "null") + "] " +
        "dataEntries[" + (this.dataEntries ? <any>this.dataEntries.length : "null") + "]";
    }

    read(reader: io.BufferReader) {
      var baseVirtualOffset = reader.getVirtualOffset();
      this.readCore(reader, baseVirtualOffset);
    }

    private readCore(reader: io.BufferReader, baseVirtualOffset: number) {
      this.characteristics = reader.readInt();

      if (!this.timestamp)
              this.timestamp = new Date(0);
      this.timestamp.setTime(reader.readInt() * 1000);

      this.version = reader.readShort() + "." + reader.readShort();
      var nameEntryCount = reader.readShort();
      var idEntryCount = reader.readShort();

      var dataEntryCount = 0;
      var directoryEntryCount = 0;

      for (var i = 0; i < nameEntryCount + idEntryCount; i++) {
        var idOrNameRva = reader.readInt();
        var contentRva = reader.readInt();

        var saveOffset = reader.offset;

        var name: string;
        var id: number;

        var highBit = 0x80000000;

        if (idOrNameRva < highBit) {
          id = idOrNameRva;
          name = null;
        }
        else {
          id = 0;
          reader.setVirtualOffset(baseVirtualOffset + idOrNameRva - highBit);
          name = this.readName(reader);
        }

        if (contentRva < highBit) { // high bit is not set
          reader.setVirtualOffset(baseVirtualOffset + contentRva);

          var dataEntry = this.dataEntries[dataEntryCount];
          if (!dataEntry)
                  this.dataEntries[dataEntryCount] = dataEntry = new ResourceDataEntry();

          dataEntry.name = name;
          dataEntry.integerId = id;

          dataEntry.dataRva = reader.readInt();
          dataEntry.size = reader.readInt();
          dataEntry.codepage = reader.readInt();
          dataEntry.reserved = reader.readInt();

          dataEntryCount++;
        }
        else {
          contentRva = contentRva - highBit; // clear hight bit
          reader.setVirtualOffset(baseVirtualOffset + contentRva);

          var directoryEntry = this.subdirectories[directoryEntryCount];
          if (!directoryEntry)
                  this.subdirectories[directoryEntryCount] = directoryEntry = new ResourceDirectoryEntry();

          directoryEntry.name = name;
          directoryEntry.integerId = id;

          directoryEntry.directory = new ResourceDirectory();
          directoryEntry.directory.readCore(reader, baseVirtualOffset);

          directoryEntryCount++;
        }
      }

      this.dataEntries.length = dataEntryCount;
      this.subdirectories.length = directoryEntryCount;
    }

    readName(reader: io.BufferReader): string {

        var length = reader.readShort();
        var result = "";

        for (var i = 0; i < length; i++) {
            result += String.fromCharCode(reader.readShort());
        }

        return result;
    }
  }

}