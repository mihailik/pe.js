module pe.headers {

  export class PEHeader {
    static intSize = 6;

    pe: PESignature = PESignature.PE;

    /**
     * The architecture type of the computer.
     * An image file can only be run on the specified computer or a system that emulates the specified computer.
     */
    machine: Machine = Machine.I386;

    /**
     * UShort. Indicates the size of the section table, which immediately follows the headers.
     * Note that the Windows loader limits the number of sections to 96.
     */
    numberOfSections: number = 0;

    /**
     * The low 32 bits of the time stamp of the image.
     * This represents the date and time the image was created by the linker.
     * The value is represented in the number of seconds elapsed since
     * midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
     * according to the system clock.
     */
    timestamp: Date = new Date(0);

    /**
     * UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
     */
    pointerToSymbolTable: number = 0;

    /**
     * UInt. The number of symbols in the symbol table.
     */
    numberOfSymbols: number = 0;

    /**
     * UShort. The size of the optional header, in bytes. This value should be 0 for object files.
     */
    sizeOfOptionalHeader: number = 0;

    /**
     * The characteristics of the image.
     */
    characteristics: ImageCharacteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;

    toString() {
      var result =
        pe.formatEnum(this.machine, Machine) + " " +
        pe.formatEnum(this.characteristics, ImageCharacteristics) + " " +
        "Sections[" + this.numberOfSections + "]";
      return result;
    }

    read(reader: io.BufferReader) {
      this.pe = reader.readInt();
      if (this.pe != <number>PESignature.PE)
        throw new Error("PE signature is invalid: " + (<number>(this.pe)).toString(16).toUpperCase() + "h.");

      this.machine = reader.readShort();
      this.numberOfSections = reader.readShort();

      if (!this.timestamp)
        this.timestamp = new Date(0);
      this.timestamp.setTime(reader.readInt() * 1000);

      this.pointerToSymbolTable = reader.readInt();
      this.numberOfSymbols = reader.readInt();
      this.sizeOfOptionalHeader = reader.readShort();
      this.characteristics = reader.readShort();
    }

  }
}