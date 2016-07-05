module pe.headers {

  // TODO: move it in its own file (why TF it doesn't compile now??)
  export class AddressRange {
    constructor(public address?: number, public size?: number) {
      if (!this.address)
        this.address = 0;
      if (!this.size)
        this.size = 0;
    }

    mapRelative(offset: number): number {
      var result = offset - this.address;
      if (result >= 0 && result < this.size)
        return result;
      else
        return -1;
    }

    toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
  }

  export class AddressRangeMap extends AddressRange {
    constructor(address?: number, size?: number, public virtualAddress?: number) {
      super(address, size);

      if (!this.virtualAddress)
        this.virtualAddress = 0;
    }

    toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h"; }
  }

  
  
  
  export class SectionHeader extends AddressRangeMap {

    static intSize = 16;

    /**
     * An 8-byte, null-padded UTF-8 string.
     * There is no terminating null character if the string is exactly eight characters long.
     * For longer names, this member contains a forward slash (/)
     * followed by an ASCII representation of a decimal number that is an offset into the string table.
     * Executable images do not use a string table
     * and do not support section names longer than eight characters.
     */
    name: string = "";

    /**
     * If virtualSize value is greater than the size member, the section is filled with zeroes.
     * This field is valid only for executable images and should be set to 0 for object files.
     */
    virtualSize: number;

    /**
     * A file pointer to the beginning of the relocation entries for the section.
     * If there are no relocations, this value is zero.
     */
    pointerToRelocations: number = 0;

    /**
     * A file pointer to the beginning of the line-number entries for the section.
     * If there are no COFF line numbers, this value is zero.
     */
    pointerToLinenumbers: number = 0;

    /**
     * Ushort.
     * The number of relocation entries for the section.
     * This value is zero for executable images.
     */
    numberOfRelocations: number = 0;

    /**
     * Ushort.
     * The number of line-number entries for the section.
     */
    numberOfLinenumbers: number = 0;

    /**
     * The characteristics of the image.
     */
    characteristics: SectionCharacteristics = SectionCharacteristics.ContainsCode;

    constructor() {
      super();
    }

    toString() {
      var result = this.name + " " + super.toString();
      return result;
    }

    read(reader: io.BufferReader) {
      this.name = reader.readZeroFilledAscii(8);

      this.virtualSize = reader.readInt();
      this.virtualAddress = reader.readInt();

      var sizeOfRawData = reader.readInt();
      var pointerToRawData = reader.readInt();
      
      this.size = sizeOfRawData;
      this.address = pointerToRawData;

      this.pointerToRelocations = reader.readInt();
      this.pointerToLinenumbers = reader.readInt();
      this.numberOfRelocations = reader.readShort();
      this.numberOfLinenumbers = reader.readShort();
      this.characteristics = <SectionCharacteristics>reader.readInt();
    }

  }

}