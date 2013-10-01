/// <reference path='io2.ts' />

module pe.headers {
  
  export class DosHeader {
    static size = 64;

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

    res0: number = 0;
    res1: number = 0;

    /**
     * OEM identifier (for e_oeminfo).
     */
    oemid: number = 0;

    /**
     * OEM information: number; e_oemid specific.
     */
    oeminfo: number = 0;

    reserved0: number = 0;
    reserved1: number = 0;
    reserved2: number = 0;
    reserved3: number = 0;
    reserved4: number = 0;

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

    populateFromUInt32Array(buf: Uint32Array, pos: number) {
      var i = buf[pos];
      this.mz = i & 0xFFFF;
      this.cblp = (i >> 16) & 0xFFFF;
      i = buf[pos+1];
      this.cp = i & 0xFFFF;
      this.crlc = (i >> 16) & 0xFFFF;
      i = buf[pos+2];
      this.cparhdr = i & 0xFFFF;
      this.minalloc = (i >> 16) & 0xFFFF;
      i = buf[pos+3];
      this.maxalloc = i & 0xFFFF;
      this.ss = (i >> 16) & 0xFFFF;
      i = buf[pos+4];
      this.sp = i & 0xFFFF;
      this.csum = (i >> 16) & 0xFFFF;
      i = buf[pos+5];
      this.ip = i & 0xFFFF;
      this.cs = (i >> 16) & 0xFFFF;
      i = buf[pos+6];
      this.lfarlc = i & 0xFFFF;
      this.ovno = (i >> 16) & 0xFFFF;
      this.res0 = buf[pos+7];
      this.res1 = buf[pos+8];
      i = buf[pos+9];
      this.oemid = i & 0xFFFF;
      this.oeminfo = (i >> 16) & 0xFFFF;
      this.reserved0 = buf[pos+10];
      this.reserved1 = buf[pos+11];
      this.reserved2 = buf[pos+12];
      this.reserved3 = buf[pos+13];
      this.reserved4 = buf[pos+14];

      this.lfanew = buf[pos+16];
    }
  }

  export enum MZSignature {
    MZ =
      "M".charCodeAt(0) +
      ("Z".charCodeAt(0) << 8)
  }

}