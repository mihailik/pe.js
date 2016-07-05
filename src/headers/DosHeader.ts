module pe.headers {
  
  export class DosHeader {
    static intSize = 16;

    mz: MZSignature = MZSignature.MZ;

    /**
     * Bytes on last page of file.
     */
    cblp: number = 144;

    /**
     * Pages in file.
     */
    cp: number = 3;

    /**
     * Relocations.
     */
    crlc: number = 0;

    /**
     * Size of header in paragraphs.
     */
    cparhdr: number = 4;

    /**
     * Minimum extra paragraphs needed.
     */
    minalloc: number = 0;

    /**
     * Maximum extra paragraphs needed.
     */
    maxalloc: number = 65535;

    /**
     * Initial (relative) SS value.
     */
    ss: number = 0;

    /**
     * Initial SP value.
     */
    sp: number = 184;

    /**
     * Checksum.
     */
    csum: number = 0;

    /**
     * Initial IP value.
     */
    ip: number = 0;

    /**
     * Initial (relative) CS value.
     */
    cs: number = 0;

    /**
     * File address of relocation table.
     */
    lfarlc: number = 64;

    /**
     * Overlay number.
     */
    ovno: number = 0;

    res1: Long = new Long(0,0);

    /**
     * OEM identifier (for e_oeminfo).
     */
    oemid: number = 0;

    /**
     * OEM information: number; e_oemid specific.
     */
    oeminfo: number = 0;

    reserved: number[] = [0,0,0,0,0];

    /**
     * uint: File address of PE header.
     */
    lfanew: number = 0;

    toString() {
      var result =
        "[" +
        (this.mz === MZSignature.MZ ? "MZ" :
        typeof this.mz === "number" ? (<number>this.mz).toString(16).toUpperCase() + "h" :
        typeof this.mz) + "]" +

        ".lfanew=" +
        (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" :
        typeof this.lfanew);

      return result;
    }

    read(reader: io.BufferReader) {
      this.mz = reader.readShort();
      if (this.mz != MZSignature.MZ)
        throw new Error("MZ signature is invalid: " + (<number>(this.mz)).toString(16).toUpperCase() + "h.");

      this.cblp = reader.readShort();
      this.cp = reader.readShort();
      this.crlc = reader.readShort();
      this.cparhdr = reader.readShort();
      this.minalloc = reader.readShort();
      this.maxalloc = reader.readShort();
      this.ss = reader.readShort();
      this.sp = reader.readShort();
      this.csum = reader.readShort();
      this.ip = reader.readShort();
      this.cs = reader.readShort();
      this.lfarlc = reader.readShort();
      this.ovno = reader.readShort();

      this.res1 = reader.readLong();

      this.oemid = reader.readShort();
      this.oeminfo = reader.readShort();

      if (!this.reserved)
        this.reserved = [];

      for (var i = 0; i < 5; i++) {
        this.reserved[i] = reader.readInt();
      }

      this.reserved.length = 5;

      this.lfanew = reader.readInt();
    }

  }
}