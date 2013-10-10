/// <reference path='io2.ts' />

module pe.headers {
  
  export class DosHeader {
    static byteSize = 64;

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

  export class PEHeader {
    static byteSize = 24;

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
        pe.io.formatEnum(this.machine, Machine) + " " +
        pe.io.formatEnum(this.characteristics, ImageCharacteristics) + " " +
        "Sections[" + this.numberOfSections + "]";
      return result;
    }

    populateFromUInt32Array(buf: Uint32Array, pos: number) {
      this.pe = buf[pos];

      var i = buf[pos+1];
      this.machine = i & 0xFFFF;
      this.numberOfSections = (i >> 16) & 0xFFFF;

      if (!this.timestamp)
        this.timestamp = new Date(0);
      this.timestamp.setTime(buf[pos+2] * 1000);

      this.pointerToSymbolTable = buf[pos+3];
      this.numberOfSymbols = buf[pos+4];

      i = buf[pos+5];
      this.sizeOfOptionalHeader = i & 0xFFFF;
      this.characteristics = (i >> 16) & 0xFFFF;
    }
  }

  export enum PESignature {
    PE =
      "P".charCodeAt(0) +
      ("E".charCodeAt(0) << 8)
  }

  export enum Machine {
    /**
     * The target CPU is unknown or not specified.
     */
    Unknown = 0x0000,

    /**
     * Intel 386.
     */
    I386 = 0x014C,

    /**
     * MIPS little-endian
     */
    R3000 = 0x0162,

    /**
     * MIPS little-endian
     */
    R4000 = 0x0166,

    /**
     * MIPS little-endian
     */
    R10000 = 0x0168,

    /**
     * MIPS little-endian WCE v2
     */
    WCEMIPSV2 = 0x0169,

    /**
     * Alpha_AXP
     */
    Alpha = 0x0184,

    /**
     * SH3 little-endian
     */
    SH3 = 0x01a2,

    /**
     * SH3 little-endian. DSP.
     */
    SH3DSP = 0x01a3,

    /**
     * SH3E little-endian.
     */
    SH3E = 0x01a4,

    /**
     * SH4 little-endian.
     */
    SH4 = 0x01a6,

    /**
     * SH5.
     */
    SH5 = 0x01a8,

    /**
     * ARM Little-Endian
     */
    ARM = 0x01c0,

    /**
     * Thumb.
     */
    Thumb = 0x01c2,

    /**
     * AM33
     */
    AM33 = 0x01d3,

    /**
     * IBM PowerPC Little-Endian
     */
    PowerPC = 0x01F0,

    /**
     * PowerPCFP
     */
    PowerPCFP = 0x01f1,

    /**
     * Intel 64
     */
    IA64 = 0x0200,

    /**
     * MIPS
     */
    MIPS16 = 0x0266,

    /**
     * ALPHA64
     */
    Alpha64 = 0x0284,

    /**
     * MIPS
     */
    MIPSFPU = 0x0366,

    /**
     * MIPS
     */
    MIPSFPU16 = 0x0466,

    /**
     * AXP64
     */
    AXP64 = Alpha64,

    /**
     * Infineon
     */
    Tricore = 0x0520,

    /**
     * CEF
     */
    CEF = 0x0CEF,

    /**
     * EFI Byte Code
     */
    EBC = 0x0EBC,

    /**
     * AMD64 (K8)
     */
    AMD64 = 0x8664,

    /**
     * M32R little-endian
     */
    M32R = 0x9041,

    /**
     * CEE
     */
    CEE = 0xC0EE,
  }

  export enum ImageCharacteristics {
    /**
     * Relocation information was stripped from the file.
     * The file must be loaded at its preferred base address.
     * If the base address is not available, the loader reports an error.
     */
    RelocsStripped = 0x0001,

    /**
     * The file is executable (there are no unresolved external references).
     */
    ExecutableImage = 0x0002,

    /**
     * COFF line numbers were stripped from the file.
     */
    LineNumsStripped = 0x0004,

    /**
     * COFF symbol table entries were stripped from file.
     */
    LocalSymsStripped = 0x0008,

    /**
     * Aggressively trim the working set.
     * This value is obsolete as of Windows 2000.
     */
    AggressiveWsTrim = 0x0010,

    /**
     * The application can handle addresses larger than 2 GB.
     */
    LargeAddressAware = 0x0020,

    /**
     * The bytes of the word are reversed. This flag is obsolete.
     */
    BytesReversedLo = 0x0080,

    /**
     * The computer supports 32-bit words.
     */
    Bit32Machine = 0x0100,

    /**
     * Debugging information was removed and stored separately in another file.
     */
    DebugStripped = 0x0200,

    /**
     * If the image is on removable media, copy it to and run it from the swap file.
     */
    RemovableRunFromSwap = 0x0400,

    /**
     * If the image is on the network, copy it to and run it from the swap file.
     */
    NetRunFromSwap = 0x0800,

    /**
     * The image is a system file.
     */
    System = 0x1000,

    /**
     * The image is a DLL file.
     * While it is an executable file, it cannot be run directly.
     */
    Dll = 0x2000,

    /**
     * The file should be run only on a uniprocessor computer.
     */
    UpSystemOnly = 0x4000,

    /**
     * The bytes of the word are reversed. This flag is obsolete.
     */
    BytesReversedHi = 0x8000
  }

}