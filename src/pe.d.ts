declare module pe.io {
    /**
    * 64-bit integer
    */
    class Long {
        public lo: number;
        public hi: number;
        constructor(lo: number, hi: number);
        public toString(): string;
    }
    class IntStream {
        public buf: Uint32Array;
        public size: number;
        constructor(bufLength: number);
        public read(count: number, success: () => void, failure: (e: Error) => void): void;
    }
    /**
    * Address and size of a chunk of memory.
    */
    class AddressRange {
        public address: number;
        public size: number;
        constructor(address?: number, size?: number);
        /**
        * Given an offset within range, calculates the absolute offset.
        * In case of overflow returns -1.
        */
        public mapRelative(offsetWithinRange: number): number;
        public toString(): string;
    }
    /**
    * Address range that's mapped at a virtual address.
    */
    class MappedAddressRange extends AddressRange {
        public virtualAddress: number;
        constructor(address?: number, size?: number, virtualAddress?: number);
        public toString(): string;
    }
    class BufferReader {
        private _view;
        public offset: number;
        public sections: MappedAddressRange[];
        private _currentSectionIndex;
        constructor(array: number[]);
        constructor(buffer: ArrayBuffer);
        constructor(view: DataView);
        public readByte(): number;
        public peekByte(): number;
        public readShort(): number;
        public readInt(): number;
        public readLong(): Long;
        public readBytes(length: number): Uint8Array;
        public readZeroFilledAscii(length: number): string;
        public readAsciiZ(maxLength?: number): string;
        public readUtf8Z(maxLength: number): string;
        public getVirtualOffset(): number;
        public setVirtualOffset(rva: number): void;
        private tryMapToVirtual(offset);
    }
    class ArrayReader extends BufferReader {
        private _array;
        public offset: number;
        public sections: MappedAddressRange[];
        constructor(_array: number[]);
        public readByte(): number;
        public peekByte(): number;
        public readShort(): number;
        public readInt(): number;
        public readLong(): Long;
        public readBytes(length: number): Uint8Array;
        public readZeroFilledAscii(length: number): string;
        public readAsciiZ(maxLength?: number): string;
        public readUtf8Z(maxLength: number): string;
        public getVirtualOffset(): number;
        public setVirtualOffset(rva: number): void;
        private _tryMapToVirtual(offset);
    }
    function getFileBufferReader(file: File, onsuccess: (BufferReader: any) => void, onfailure: (Error: any) => void): void;
    function getUrlBufferReader(url: string, onsuccess: (BufferReader: any) => void, onfailure: (Error: any) => void): void;
    function bytesToHex(bytes: Uint8Array): string;
    function formatEnum(value: any, type: any): string;
}
declare module pe.headers {
    class PEFileHeaders {
        public dosHeader: DosHeader;
        public dosStub: Uint8Array;
        public peHeader: PEHeader;
        public optionalHeader: OptionalHeader;
        public sectionHeaders: SectionHeader[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    class DosHeader {
        static size: number;
        public mz: MZSignature;
        /**
        * Bytes on last page of file.
        */
        public cblp: number;
        /**
        * Pages in file.
        */
        public cp: number;
        /**
        * Relocations.
        */
        public crlc: number;
        /**
        * Size of header in paragraphs.
        */
        public cparhdr: number;
        /**
        * Minimum extra paragraphs needed.
        */
        public minalloc: number;
        /**
        * Maximum extra paragraphs needed.
        */
        public maxalloc: number;
        /**
        * Initial (relative) SS value.
        */
        public ss: number;
        /**
        * Initial SP value.
        */
        public sp: number;
        /**
        * Checksum.
        */
        public csum: number;
        /**
        * Initial IP value.
        */
        public ip: number;
        /**
        * Initial (relative) CS value.
        */
        public cs: number;
        /**
        * File address of relocation table.
        */
        public lfarlc: number;
        /**
        * Overlay number.
        */
        public ovno: number;
        public res1: pe.io.Long;
        /**
        * OEM identifier (for e_oeminfo).
        */
        public oemid: number;
        /**
        * OEM information: number; e_oemid specific.
        */
        public oeminfo: number;
        public reserved: number[];
        /**
        * uint: File address of PE header.
        */
        public lfanew: number;
        public toString(): string;
        public populateFromUInt32Array(buf: Uint32Array, pos: number): void;
        public read(reader: pe.io.BufferReader): void;
    }
    enum MZSignature {
        MZ,
    }
    class PEHeader {
        public pe: PESignature;
        /**
        * The architecture type of the computer.
        * An image file can only be run on the specified computer or a system that emulates the specified computer.
        */
        public machine: Machine;
        /**
        * UShort. Indicates the size of the section table, which immediately follows the headers.
        * Note that the Windows loader limits the number of sections to 96.
        */
        public numberOfSections: number;
        /**
        * The low 32 bits of the time stamp of the image.
        * This represents the date and time the image was created by the linker.
        * The value is represented in the number of seconds elapsed since
        * midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
        * according to the system clock.
        */
        public timestamp: Date;
        /**
        * UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
        */
        public pointerToSymbolTable: number;
        /**
        * UInt. The number of symbols in the symbol table.
        */
        public numberOfSymbols: number;
        /**
        * UShort. The size of the optional header, in bytes. This value should be 0 for object files.
        */
        public sizeOfOptionalHeader: number;
        /**
        * The characteristics of the image.
        */
        public characteristics: ImageCharacteristics;
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum PESignature {
        PE,
    }
    enum Machine {
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
        AXP64,
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
    enum ImageCharacteristics {
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
        BytesReversedHi = 0x8000,
    }
    class OptionalHeader {
        public peMagic: PEMagic;
        public linkerVersion: string;
        /**
        * The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
        */
        public sizeOfCode: number;
        /**
        * The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
        */
        public sizeOfInitializedData: number;
        /**
        * The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
        */
        public sizeOfUninitializedData: number;
        /**
        * A pointer to the entry point function, relative to the image base address.
        * For executable files, this is the starting address.
        * For device drivers, this is the address of the initialization function.
        * The entry point function is optional for DLLs.
        * When no entry point is present, this member is zero.
        */
        public addressOfEntryPoint: number;
        /**
        * A pointer to the beginning of the code section, relative to the image base.
        */
        public baseOfCode: number;
        /**
        * A pointer to the beginning of the data section, relative to the image base.
        */
        public baseOfData: number;
        /**
        * Uint or 64-bit long.
        * The preferred address of the first byte of the image when it is loaded in memory.
        * This value is a multiple of 64K bytes.
        * The default value for DLLs is 0x10000000.
        * The default value for applications is 0x00400000,
        * except on Windows CE where it is 0x00010000.
        */
        public imageBase: any;
        /**
        * The alignment of sections loaded in memory, in bytes.
        * This value must be greater than or equal to the FileAlignment member.
        * The default value is the page size for the system.
        */
        public sectionAlignment: number;
        /**
        * The alignment of the raw data of sections in the image file, in bytes.
        * The value should be a power of 2 between 512 and 64K (inclusive).
        * The default is 512.
        * If the <see cref="SectionAlignment"/> member is less than the system page size,
        * this member must be the same as <see cref="SectionAlignment"/>.
        */
        public fileAlignment: number;
        /**
        * The version of the required operating system.
        */
        public operatingSystemVersion: string;
        /**
        * The version of the image.
        */
        public imageVersion: string;
        /**
        * The version of the subsystem.
        */
        public subsystemVersion: string;
        /**
        * This member is reserved and must be 0.
        */
        public win32VersionValue: number;
        /**
        * The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
        */
        public sizeOfImage: number;
        /**
        * The combined size of the MS-DOS stub, the PE header, and the section headers,
        * rounded to a multiple of the value specified in the FileAlignment member.
        */
        public sizeOfHeaders: number;
        /**
        * The image file checksum.
        * The following files are validated at load time:
        * all drivers,
        * any DLL loaded at boot time,
        * and any DLL loaded into a critical system process.
        */
        public checkSum: number;
        /**
        * The subsystem required to run this image.
        */
        public subsystem: Subsystem;
        /**
        * The DLL characteristics of the image.
        */
        public dllCharacteristics: DllCharacteristics;
        /**
        * Uint or 64 bit long.
        * The number of bytes to reserve for the stack.
        * Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
        * the rest is made available one page at a time until this reserve size is reached.
        */
        public sizeOfStackReserve: any;
        /**
        * Uint or 64 bit long.
        * The number of bytes to commit for the stack.
        */
        public sizeOfStackCommit: any;
        /**
        * Uint or 64 bit long.
        * The number of bytes to reserve for the local heap.
        * Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
        * the rest is made available one page at a time until this reserve size is reached.
        */
        public sizeOfHeapReserve: any;
        /**
        * Uint or 64 bit long.
        * The number of bytes to commit for the local heap.
        */
        public sizeOfHeapCommit: any;
        /**
        * This member is obsolete.
        */
        public loaderFlags: number;
        /**
        * The number of directory entries in the remainder of the optional header.
        * Each entry describes a location and size.
        */
        public numberOfRvaAndSizes: number;
        public dataDirectories: pe.io.AddressRange[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum PEMagic {
        NT32 = 0x010B,
        NT64 = 0x020B,
        ROM = 0x107,
    }
    enum Subsystem {
        /**
        * Unknown subsystem.
        */
        Unknown = 0,
        /**
        * No subsystem required (device drivers and native system processes).
        */
        Native = 1,
        /**
        * Windows graphical user interface (GUI) subsystem.
        */
        WindowsGUI = 2,
        /**
        * Windows character-mode user interface (CUI) subsystem.
        */
        WindowsCUI = 3,
        /**
        * OS/2 console subsystem.
        */
        OS2CUI = 5,
        /**
        * POSIX console subsystem.
        */
        POSIXCUI = 7,
        /**
        * Image is a native Win9x driver.
        */
        NativeWindows = 8,
        /**
        * Windows CE system.
        */
        WindowsCEGUI = 9,
        /**
        * Extensible Firmware Interface (EFI) application.
        */
        EFIApplication = 10,
        /**
        * EFI driver with boot services.
        */
        EFIBootServiceDriver = 11,
        /**
        * EFI driver with run-time services.
        */
        EFIRuntimeDriver = 12,
        /**
        * EFI ROM image.
        */
        EFIROM = 13,
        /**
        * Xbox system.
        */
        XBOX = 14,
        /**
        * Boot application.
        */
        BootApplication = 16,
    }
    enum DllCharacteristics {
        /**
        * Reserved.
        */
        ProcessInit = 0x0001,
        /**
        * Reserved.
        */
        ProcessTerm = 0x0002,
        /**
        * Reserved.
        */
        ThreadInit = 0x0004,
        /**
        * Reserved.
        */
        ThreadTerm = 0x0008,
        /**
        * The DLL can be relocated at load time.
        */
        DynamicBase = 0x0040,
        /**
        * Code integrity checks are forced.
        * If you set this flag and a section contains only uninitialized data,
        * set the PointerToRawData member of IMAGE_SECTION_HEADER
        * for that section to zero;
        * otherwise, the image will fail to load because the digital signature cannot be verified.
        */
        ForceIntegrity = 0x0080,
        /**
        * The image is compatible with data execution prevention (DEP).
        */
        NxCompatible = 0x0100,
        /**
        * The image is isolation aware, but should not be isolated.
        */
        NoIsolation = 0x0200,
        /**
        * The image does not use structured exception handling (SEH). No SE handler may reside in this image.
        */
        NoSEH = 0x0400,
        /**
        * Do not bind this image.
        */
        NoBind = 0x0800,
        /**
        * The image must run inside an AppContainer.
        */
        AppContainer = 0x1000,
        /**
        * WDM (Windows Driver Model) driver.
        */
        WdmDriver = 0x2000,
        /**
        * Reserved (no specific name).
        */
        Reserved = 0x4000,
        /**
        * The image is terminal server aware.
        */
        TerminalServerAware = 0x8000,
    }
    enum DataDirectoryKind {
        ExportSymbols = 0,
        ImportSymbols = 1,
        Resources = 2,
        Exception = 3,
        Security = 4,
        BaseRelocation = 5,
        Debug = 6,
        CopyrightString = 7,
        Unknown = 8,
        ThreadLocalStorage = 9,
        LoadConfiguration = 10,
        BoundImport = 11,
        ImportAddressTable = 12,
        DelayImport = 13,
        /**
        * Common Language Runtime, look for ClrDirectory at that offset.
        */
        Clr = 14,
    }
    class SectionHeader extends pe.io.MappedAddressRange {
        /**
        * An 8-byte, null-padded UTF-8 string.
        * There is no terminating null character if the string is exactly eight characters long.
        * For longer names, this member contains a forward slash (/)
        * followed by an ASCII representation of a decimal number that is an offset into the string table.
        * Executable images do not use a string table
        * and do not support section names longer than eight characters.
        */
        public name: string;
        /**
        * If virtualSize value is greater than the size member, the section is filled with zeroes.
        * This field is valid only for executable images and should be set to 0 for object files.
        */
        public virtualSize: number;
        /**
        * A file pointer to the beginning of the relocation entries for the section.
        * If there are no relocations, this value is zero.
        */
        public pointerToRelocations: number;
        /**
        * A file pointer to the beginning of the line-number entries for the section.
        * If there are no COFF line numbers, this value is zero.
        */
        public pointerToLinenumbers: number;
        /**
        * Ushort.
        * The number of relocation entries for the section.
        * This value is zero for executable images.
        */
        public numberOfRelocations: number;
        /**
        * Ushort.
        * The number of line-number entries for the section.
        */
        public numberOfLinenumbers: number;
        /**
        * The characteristics of the image.
        */
        public characteristics: SectionCharacteristics;
        constructor();
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum SectionCharacteristics {
        Reserved_0h = 0x00000000,
        Reserved_1h = 0x00000001,
        Reserved_2h = 0x00000002,
        Reserved_4h = 0x00000004,
        /**
        * The section should not be padded to the next boundary.
        * This flag is obsolete and is replaced by Align1Bytes.
        */
        NoPadding = 0x00000008,
        Reserved_10h = 0x00000010,
        /**
        * The section contains executable code.
        */
        ContainsCode = 0x00000020,
        /**
        * The section contains initialized data.
        */
        ContainsInitializedData = 0x00000040,
        /**
        * The section contains uninitialized data.
        */
        ContainsUninitializedData = 0x00000080,
        /**
        * Reserved.
        */
        LinkerOther = 0x00000100,
        /**
        * The section contains comments or other information.
        * This is valid only for object files.
        */
        LinkerInfo = 0x00000200,
        Reserved_400h = 0x00000400,
        /**
        * The section will not become part of the image.
        * This is valid only for object files.
        */
        LinkerRemove = 0x00000800,
        /**
        * The section contains COMDAT data.
        * This is valid only for object files.
        */
        LinkerCOMDAT = 0x00001000,
        Reserved_2000h = 0x00002000,
        /**
        * Reset speculative exceptions handling bits in the TLB entries for this section.
        */
        NoDeferredSpeculativeExecution = 0x00004000,
        /**
        * The section contains data referenced through the global pointer.
        */
        GlobalPointerRelative = 0x00008000,
        Reserved_10000h = 0x00010000,
        /**
        * Reserved.
        */
        MemoryPurgeable = 0x00020000,
        /**
        * Reserved.
        */
        MemoryLocked = 0x00040000,
        /**
        * Reserved.
        */
        MemoryPreload = 0x00080000,
        /**
        * Align data on a 1-byte boundary.
        * This is valid only for object files.
        */
        Align1Bytes = 0x00100000,
        /**
        * Align data on a 2-byte boundary.
        * This is valid only for object files.
        */
        Align2Bytes = 0x00200000,
        /**
        * Align data on a 4-byte boundary.
        * This is valid only for object files.
        */
        Align4Bytes = 0x00300000,
        /**
        * Align data on a 8-byte boundary.
        * This is valid only for object files.
        */
        Align8Bytes = 0x00400000,
        /**
        * Align data on a 16-byte boundary.
        * This is valid only for object files.
        */
        Align16Bytes = 0x00500000,
        /**
        * Align data on a 32-byte boundary.
        * This is valid only for object files.
        */
        Align32Bytes = 0x00600000,
        /**
        * Align data on a 64-byte boundary.
        * This is valid only for object files.
        */
        Align64Bytes = 0x00700000,
        /**
        * Align data on a 128-byte boundary.
        * This is valid only for object files.
        */
        Align128Bytes = 0x00800000,
        /**
        * Align data on a 256-byte boundary.
        * This is valid only for object files.
        */
        Align256Bytes = 0x00900000,
        /**
        * Align data on a 512-byte boundary.
        * This is valid only for object files.
        */
        Align512Bytes = 0x00A00000,
        /**
        * Align data on a 1024-byte boundary.
        * This is valid only for object files.
        */
        Align1024Bytes = 0x00B00000,
        /**
        * Align data on a 2048-byte boundary.
        * This is valid only for object files.
        */
        Align2048Bytes = 0x00C00000,
        /**
        * Align data on a 4096-byte boundary.
        * This is valid only for object files.
        */
        Align4096Bytes = 0x00D00000,
        /**
        * Align data on a 8192-byte boundary.
        * This is valid only for object files.
        */
        Align8192Bytes = 0x00E00000,
        /**
        * The section contains extended relocations.
        * The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
        * If the NumberOfRelocations field in the section header is 0xffff,
        * the actual relocation count is stored in the VirtualAddress field of the first relocation.
        * It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
        */
        LinkerRelocationOverflow = 0x01000000,
        /**
        * The section can be discarded as needed.
        */
        MemoryDiscardable = 0x02000000,
        /**
        * The section cannot be cached.
        */
        MemoryNotCached = 0x04000000,
        /**
        * The section cannot be paged.
        */
        MemoryNotPaged = 0x08000000,
        /**
        * The section can be shared in memory.
        */
        MemoryShared = 0x10000000,
        /**
        * The section can be executed as code.
        */
        MemoryExecute = 0x20000000,
        /**
        * The section can be read.
        */
        MemoryRead = 0x40000000,
        /**
        * The section can be written to.
        */
        MemoryWrite = 0x80000000,
    }
}
declare module pe.unmanaged {
    class DllExport {
        public name: string;
        public ordinal: number;
        /**
        * The address of the exported symbol when loaded into memory, relative to the image base.
        * For example, the address of an exported function.
        */
        public exportRva: number;
        /**
        * Null-terminated ASCII string in the export section.
        * This string must be within the range that is given by the export table data directory entry.
        * This string gives the DLL name and the name of the export (for example, "MYDLL.expfunc")
        * or the DLL name and the ordinal number of the export (for example, "MYDLL.#27").
        */
        public forwarder: string;
        static readExports(reader: pe.io.BufferReader, range: pe.io.AddressRange): DllExports;
        private readExportEntry(reader, range);
    }
    interface DllExports {
        length: number;
        [i: number]: DllExport;
        flags: number;
        timestamp: Date;
        version: string;
        dllName: any;
        ordinalBase: any;
    }
    class DllImport {
        public name: string;
        public ordinal: number;
        public dllName: string;
        public timeDateStamp: Date;
        static read(reader: pe.io.BufferReader, result?: DllImport[]): DllImport[];
        private readEntry(reader);
    }
    class ResourceDirectory {
        public characteristics: number;
        public timestamp: Date;
        public version: string;
        public subdirectories: ResourceDirectoryEntry[];
        public dataEntries: ResourceDataEntry[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
        private readCore(reader, baseVirtualOffset);
        public readName(reader: pe.io.BufferReader): string;
    }
    class ResourceDirectoryEntry {
        public name: string;
        public integerId: number;
        public directory: ResourceDirectory;
        public toString(): string;
    }
    class ResourceDataEntry {
        public name: string;
        public integerId: number;
        public dataRva: number;
        public size: number;
        public codepage: number;
        public reserved: number;
        public toString(): string;
    }
}
declare module pe.managed {
    enum ClrImageFlags {
        ILOnly = 0x00000001,
        _32BitRequired = 0x00000002,
        ILLibrary = 0x00000004,
        StrongNameSigned = 0x00000008,
        NativeEntryPoint = 0x00000010,
        TrackDebugData = 0x00010000,
        IsIbcoptimized = 0x00020000,
    }
    enum ClrMetadataSignature {
        Signature = 0x424a5342,
    }
    enum AssemblyHashAlgorithm {
        None = 0x0000,
        Reserved = 0x8003,
        Sha1 = 0x8004,
    }
    enum AssemblyFlags {
        PublicKey = 0x0001,
        Retargetable = 0x0100,
        DisableJITcompileOptimizer = 0x4000,
        EnableJITcompileTracking = 0x8000,
    }
    enum ElementType {
        End = 0x00,
        Void = 0x01,
        Boolean = 0x02,
        Char = 0x03,
        I1 = 0x04,
        U1 = 0x05,
        I2 = 0x06,
        U2 = 0x07,
        I4 = 0x08,
        U4 = 0x09,
        I8 = 0x0a,
        U8 = 0x0b,
        R4 = 0x0c,
        R8 = 0x0d,
        String = 0x0e,
        Ptr = 0x0f,
        ByRef = 0x10,
        ValueType = 0x11,
        Class = 0x12,
        Var = 0x13,
        Array = 0x14,
        GenericInst = 0x15,
        TypedByRef = 0x16,
        I = 0x18,
        U = 0x19,
        FnPtr = 0x1b,
        Object = 0x1c,
        SZArray = 0x1d,
        MVar = 0x1e,
        CMod_ReqD = 0x1f,
        CMod_Opt = 0x20,
        Internal = 0x21,
        Modifier = 0x40,
        Sentinel,
        Pinned,
        R4_Hfa,
        R8_Hfa,
        ArgumentType_,
        CustomAttribute_BoxedObject_,
        CustomAttribute_Field_,
        CustomAttribute_Property_,
        CustomAttribute_Enum_ = 0x55,
    }
    enum SecurityAction {
        Assert = 3,
        Demand = 2,
        Deny = 4,
        InheritanceDemand = 7,
        LinkDemand = 6,
        NonCasDemand = 0,
        NonCasLinkDemand = 0,
        PrejitGrant = 0,
        PermitOnly = 5,
        RequestMinimum = 8,
        RequestOptional = 9,
        RequestRefuse = 10,
    }
    enum EventAttributes {
        SpecialName = 0x0200,
        RTSpecialName = 0x0400,
    }
    enum TypeAttributes {
        VisibilityMask = 0x00000007,
        NotPublic = 0x00000000,
        Public = 0x00000001,
        NestedPublic = 0x00000002,
        NestedPrivate = 0x00000003,
        NestedFamily = 0x00000004,
        NestedAssembly = 0x00000005,
        NestedFamANDAssem = 0x00000006,
        NestedFamORAssem = 0x00000007,
        LayoutMask = 0x00000018,
        AutoLayout = 0x00000000,
        SequentialLayout = 0x00000008,
        ExplicitLayout = 0x00000010,
        ClassSemanticsMask = 0x00000020,
        Class = 0x00000000,
        Interface = 0x00000020,
        Abstract = 0x00000080,
        Sealed = 0x00000100,
        SpecialName = 0x00000400,
        Import = 0x00001000,
        Serializable = 0x00002000,
        StringFormatMask = 0x00030000,
        AnsiClass = 0x00000000,
        UnicodeClass = 0x00010000,
        AutoClass = 0x00020000,
        CustomFormatClass = 0x00030000,
        CustomStringFormatMask = 0x00C00000,
        BeforeFieldInit = 0x00100000,
        RTSpecialName = 0x00000800,
        HasSecurity = 0x00040000,
        IsTypeForwarder = 0x00200000,
    }
    enum FieldAttributes {
        FieldAccessMask = 0x0007,
        CompilerControlled = 0x0000,
        Private = 0x0001,
        FamANDAssem = 0x0002,
        Assembly = 0x0003,
        Family = 0x0004,
        FamORAssem = 0x0005,
        Public = 0x0006,
        Static = 0x0010,
        InitOnly = 0x0020,
        Literal = 0x0040,
        NotSerialized = 0x0080,
        SpecialName = 0x0200,
        PInvokeImpl = 0x2000,
        RTSpecialName = 0x0400,
        HasFieldMarshal = 0x1000,
        HasDefault = 0x8000,
        HasFieldRVA = 0x0100,
    }
    enum FileAttributes {
        ContainsMetaData = 0x0000,
        ContainsNoMetaData = 0x0001,
    }
    enum GenericParamAttributes {
        VarianceMask = 0x0003,
        None = 0x0000,
        Covariant = 0x0001,
        Contravariant = 0x0002,
        SpecialConstraintMask = 0x001C,
        ReferenceTypeConstraint = 0x0004,
        NotNullableValueTypeConstraint = 0x0008,
        DefaultConstructorConstraint = 0x0010,
    }
    enum PInvokeAttributes {
        NoMangle = 0x0001,
        CharSetMask = 0x0006,
        CharSetNotSpec = 0x0000,
        CharSetAnsi = 0x0002,
        CharSetUnicode = 0x0004,
        CharSetAuto = 0x0006,
        SupportsLastError = 0x0040,
        CallConvMask = 0x0700,
        CallConvPlatformapi = 0x0100,
        CallConvCdecl = 0x0200,
        CallConvStdcall = 0x0300,
        CallConvThiscall = 0x0400,
        CallConvFastcall = 0x0500,
    }
    enum ManifestResourceAttributes {
        VisibilityMask = 0x0007,
        Public = 0x0001,
        Private = 0x0002,
    }
    enum MethodImplAttributes {
        CodeTypeMask = 0x0003,
        IL = 0x0000,
        Native = 0x0001,
        OPTIL = 0x0002,
        Runtime = 0x0003,
        ManagedMask = 0x0004,
        Unmanaged = 0x0004,
        Managed = 0x0000,
        ForwardRef = 0x0010,
        PreserveSig = 0x0080,
        InternalCall = 0x1000,
        Synchronized = 0x0020,
        NoInlining = 0x0008,
        MaxMethodImplVal = 0xffff,
        NoOptimization = 0x0040,
    }
    enum MethodAttributes {
        MemberAccessMask = 0x0007,
        CompilerControlled = 0x0000,
        Private = 0x0001,
        FamANDAssem = 0x0002,
        Assem = 0x0003,
        Family = 0x0004,
        FamORAssem = 0x0005,
        Public = 0x0006,
        Static = 0x0010,
        Final = 0x0020,
        Virtual = 0x0040,
        HideBySig = 0x0080,
        VtableLayoutMask = 0x0100,
        ReuseSlot = 0x0000,
        NewSlot = 0x0100,
        Strict = 0x0200,
        Abstract = 0x0400,
        SpecialName = 0x0800,
        PInvokeImpl = 0x2000,
        UnmanagedExport = 0x0008,
        RTSpecialName = 0x1000,
        HasSecurity = 0x4000,
        RequireSecObject = 0x8000,
    }
    enum MethodSemanticsAttributes {
        Setter = 0x0001,
        Getter = 0x0002,
        Other = 0x0004,
        AddOn = 0x0008,
        RemoveOn = 0x0010,
        Fire = 0x0020,
    }
    enum ParamAttributes {
        In = 0x0001,
        Out = 0x0002,
        Optional = 0x0010,
        HasDefault = 0x1000,
        HasFieldMarshal = 0x2000,
        Unused = 0xcfe0,
    }
    enum PropertyAttributes {
        SpecialName = 0x0200,
        RTSpecialName = 0x0400,
        HasDefault = 0x1000,
        Unused = 0xe9ff,
    }
    enum CallingConventions {
        Default = 0x0,
        C = 0x1,
        StdCall = 0x2,
        FastCall = 0x4,
        VarArg = 0x5,
        Generic = 0x10,
        HasThis = 0x20,
        ExplicitThis = 0x40,
        Sentinel = 0x41,
    }
    enum TableKind {
        ModuleDefinition = 0x00,
        ExternalType = 0x01,
        TypeDefinition = 0x02,
        FieldDefinition = 0x04,
        MethodDefinition = 0x06,
        ParameterDefinition = 0x08,
        MemberRef = 0x0A,
        Constant = 0x0B,
        CustomAttribute = 0x0C,
        FieldMarshal = 0x0D,
        DeclSecurity = 0x0E,
        ClassLayout = 0x0F,
        InterfaceImpl = 0x09,
        FieldLayout = 0x10,
        StandAloneSig = 0x11,
        EventMap = 0x12,
        Event = 0x14,
        PropertyMap = 0x15,
        PropertyDefinition = 0x17,
        MethodSemantics = 0x18,
        MethodImpl = 0x19,
        ModuleRef = 0x1A,
        TypeSpec = 0x1B,
        ImplMap = 0x1C,
        FieldRVA = 0x1D,
        AssemblyDefinition = 0x20,
        AssemblyProcessor = 0x21,
        AssemblyOS = 0x22,
        AssemblyRef = 0x23,
        AssemblyRefProcessor = 0x24,
        AssemblyRefOS = 0x25,
        File = 0x26,
        ExportedType = 0x27,
        ManifestResource = 0x28,
        NestedClass = 0x29,
        GenericParam = 0x2A,
        MethodSpec = 0x2B,
        GenericParamConstraint = 0x2C,
    }
    class AssemblyDefinition {
        public headers: pe.headers.PEFileHeaders;
        public hashAlgId: AssemblyHashAlgorithm;
        public version: string;
        public flags: AssemblyFlags;
        public publicKey: string;
        public name: string;
        public culture: string;
        public modules: ModuleDefinition[];
        public read(reader: pe.io.BufferReader): void;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ModuleDefinition {
        public runtimeVersion: string;
        public specificRuntimeVersion: string;
        public imageFlags: ClrImageFlags;
        public metadataVersion: string;
        public tableStreamVersion: string;
        public generation: number;
        public name: string;
        public mvid: string;
        public encId: string;
        public encBaseId: string;
        public types: TypeDefinition[];
        public debugExternalTypeReferences: ExternalType[];
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class TypeReference {
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class MVar extends TypeReference {
        public index: number;
        constructor(index: number);
        public getName(): string;
        public getNamespace(): string;
    }
    class Var extends TypeReference {
        public index: number;
        constructor(index: number);
        public getName(): string;
        public getNamespace(): string;
    }
    class TypeDefinition extends TypeReference {
        public attributes: number;
        public name: string;
        public namespace: string;
        public fields: FieldDefinition[];
        public methods: MethodDefinition[];
        public baseType: any;
        public internalFieldList: number;
        public internalMethodList: number;
        constructor();
        public getName(): string;
        public getNamespace(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldDefinition {
        public attributes: number;
        public name: string;
        public customModifiers: any[];
        public customAttributes: any[];
        public type: TypeReference;
        public value: ConstantValue;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldSignature {
        public customModifiers: any[];
        public type: TypeReference;
    }
    class MethodDefinition {
        public attributes: MethodAttributes;
        public implAttributes: MethodImplAttributes;
        public name: string;
        public parameters: any[];
        public signature: MethodSignature;
        public locals: any[];
        public internalRva: number;
        public internalParamList: number;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class CustomModifier {
        public required: boolean;
        public type: TypeReference;
        constructor(required: boolean, type: TypeReference);
        public toString(): string;
    }
    class ParameterDefinition {
        public attributes: number;
        public name: string;
        public index: number;
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class PropertyDefinition {
        public attributes: number;
        public name: string;
        public isStatic: boolean;
        public customAttributes: any[];
        public customModifiers: any[];
        public type: TypeReference;
        public parameters: any[];
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class LocalVariable {
        public type: TypeReference;
        public customModifiers: any[];
        public isPinned: boolean;
    }
    class ExternalType extends TypeReference {
        public assemblyRef: any;
        private name;
        private namespace;
        constructor(assemblyRef: any, name: string, namespace: string);
        public getName(): string;
        public getNamespace(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class PointerType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
    }
    class ByRefType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
    }
    class SZArrayType extends TypeReference {
        public elementType: TypeReference;
        constructor(elementType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class SentinelType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class KnownType extends TypeReference {
        private name;
        private internalElementType;
        private static byElementType;
        constructor(name: string, internalElementType: ElementType);
        public getName(): string;
        public getNamespace(): string;
        static internalGetByElementName(elementType: ElementType): KnownType;
        static Void: KnownType;
        static Boolean: KnownType;
        static Char: KnownType;
        static SByte: KnownType;
        static Byte: KnownType;
        static Int16: KnownType;
        static UInt16: KnownType;
        static Int32: KnownType;
        static UInt32: KnownType;
        static Int64: KnownType;
        static UInt64: KnownType;
        static Single: KnownType;
        static Double: KnownType;
        static String: KnownType;
        static TypedReference: KnownType;
        static IntPtr: KnownType;
        static UIntPtr: KnownType;
        static Object: KnownType;
        public toString(): string;
    }
    class GenericInstantiation extends TypeReference {
        public genericType: TypeReference;
        public arguments: TypeReference[];
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class FunctionPointerType extends TypeReference {
        public methodSignature: MethodSignature;
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class ArrayType extends TypeReference {
        public elementType: TypeReference;
        public dimensions: ArrayDimensionRange[];
        constructor(elementType: TypeReference, dimensions: ArrayDimensionRange[]);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class ArrayDimensionRange {
        public lowBound: number;
        public length: number;
        public toString(): string;
    }
    class MethodSignature {
        public callingConvention: CallingConventions;
        public parameters: ParameterSignature[];
        public extraParameters: ParameterSignature[];
        public returnType: TypeReference;
        public toString(): string;
    }
    class ParameterSignature {
        public customModifiers: any[];
        public type: TypeReference;
        constructor(customModifiers: any[], type: TypeReference);
        public toString(): string;
    }
    class ConstantValue {
        public type: TypeReference;
        public value: any;
        constructor(type: TypeReference, value: any);
        public valueOf(): any;
    }
    class CustomAttributeData {
        public fixedArguments: any[];
        public namedArguments: any[];
        constructor();
    }
    class TableStreamReader {
        private baseReader;
        private streams;
        private tables;
        private stringHeapCache;
        constructor(baseReader: pe.io.BufferReader, streams: MetadataStreams, tables: any[][]);
        public readResolutionScope: () => any;
        public readTypeDefOrRef: () => any;
        public readHasConstant: () => any;
        public readHasCustomAttribute: () => any;
        public readCustomAttributeType: () => any;
        public readHasDeclSecurity: () => any;
        public readImplementation: () => any;
        public readHasFieldMarshal: () => any;
        public readTypeOrMethodDef: () => any;
        public readMemberForwarded: () => any;
        public readMemberRefParent: () => any;
        public readMethodDefOrRef: () => any;
        public readHasSemantics: () => any;
        public readByte(): number;
        public readInt(): number;
        public readShort(): number;
        public readString(): string;
        public readGuid(): string;
        public readBlobHex(): string;
        public readBlob(): Uint8Array;
        private readBlobIndex();
        private readBlobSize();
        public readTableRowIndex(tableIndex: number): number;
        private createCodedIndexReader(...tableTypes);
        private readPos(spaceSize);
        public readMethodSignature(definition: MethodSignature): void;
        public readMethodSpec(instantiation: TypeReference[]): void;
        private readSigMethodDefOrRefOrStandalone(sig);
        public readFieldSignature(definition: FieldDefinition): void;
        public readPropertySignature(definition: PropertyDefinition): void;
        public readSigLocalVar(): any[];
        private readSigCustomModifierOrNull();
        private readSigTypeDefOrRefOrSpecEncoded();
        private readSigCustomModifierList();
        private readSigParam();
        private readSigTypeReference();
        private readSigArrayShape(arrayElementType);
        public readMemberSignature(): any;
        private readCompressedInt();
        public readConstantValue(etype: ElementType): any;
        private readSigValue(etype, length);
        public readCustomAttribute(ctorSignature: MethodSignature): CustomAttributeData;
        private readSigFixedArg(type);
        private readSigFieldOrPropType();
        private readSigSerString();
        private readSigElem(type);
    }
    class TableStream {
        public reserved0: number;
        public version: string;
        public heapSizes: number;
        public reserved1: number;
        public tables: any[][];
        public externalTypes: ExternalType[];
        public module: ModuleDefinition;
        public assembly: AssemblyDefinition;
        public read(tableReader: pe.io.BufferReader, streams: MetadataStreams): void;
        private readTableCounts(reader, valid);
        private initTables(reader, tableCounts);
        private initTable(tableIndex, rowCount, TableType);
        private readTables(reader, streams);
    }
    class AssemblyReader {
        public read(reader: pe.io.BufferReader, assembly: AssemblyDefinition): void;
        private populateTypes(mainModule, tables);
        private populateMembers(parentTable, getChildIndex, getChildren, childTable, getChildEntity);
    }
    class AssemblyOS {
        public osplatformID: number;
        public osVersion: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyProcessor {
        public processor: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyRef {
        public definition: AssemblyDefinition;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class AssemblyRefOS {
        public definition: AssemblyDefinition;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyRefProcessor {
        public processor: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ClassLayout {
        public packingSize: number;
        public classSize: number;
        public parent: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ClrDirectory {
        private static clrHeaderSize;
        public cb: number;
        public runtimeVersion: string;
        public imageFlags: ClrImageFlags;
        public metadataDir: pe.io.AddressRange;
        public entryPointToken: number;
        public resourcesDir: pe.io.AddressRange;
        public strongNameSignatureDir: pe.io.AddressRange;
        public codeManagerTableDir: pe.io.AddressRange;
        public vtableFixupsDir: pe.io.AddressRange;
        public exportAddressTableJumpsDir: pe.io.AddressRange;
        public managedNativeHeaderDir: pe.io.AddressRange;
        public read(clrDirReader: pe.io.BufferReader): void;
    }
    class ClrMetadata {
        public mdSignature: ClrMetadataSignature;
        public metadataVersion: string;
        public runtimeVersion: string;
        public mdReserved: number;
        public mdFlags: number;
        public streamCount: number;
        public read(reader: pe.io.BufferReader): void;
    }
    class Constant {
        public isSingleton: boolean;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class CustomAttribute {
        public parent: any;
        public type: any;
        public value: CustomAttributeData;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class DeclSecurity {
        public action: SecurityAction;
        public parent: any;
        public permissionSet: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class Event {
        public eventFlags: EventAttributes;
        public name: string;
        public eventType: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class EventMap {
        public parent: number;
        public eventList: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ExportedType {
        public flags: TypeAttributes;
        public typeDefId: number;
        public typeName: string;
        public typeNamespace: string;
        public implementation: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldLayout {
        public offset: number;
        public field: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldMarshal {
        public parent: any;
        public nativeType: MarshalSpec;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MarshalSpec {
        public blob: any;
        constructor(blob: any);
    }
    class FieldRVA {
        public rva: number;
        public field: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class File {
        public flags: FileAttributes;
        public name: string;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class GenericParam {
        public number: number;
        public flags: GenericParamAttributes;
        public owner: any;
        public name: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class GenericParamConstraint {
        public owner: number;
        public constraint: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ImplMap {
        public mappingFlags: PInvokeAttributes;
        public memberForwarded: any;
        public importName: string;
        public importScope: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class InterfaceImpl {
        public classIndex: number;
        public interface: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ManifestResource {
        public offset: number;
        public flags: ManifestResourceAttributes;
        public name: string;
        public implementation: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MemberRef {
        public classIndex: any;
        public name: string;
        public signature: MethodSignature;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MetadataStreams {
        public guids: string[];
        public strings: pe.io.AddressRange;
        public blobs: pe.io.AddressRange;
        public tables: pe.io.AddressRange;
        public read(metadataBaseAddress: number, streamCount: number, reader: pe.io.BufferReader): void;
        private readAlignedNameString(reader);
        private readGuidForStream(reader);
    }
    class MethodImpl {
        public classIndex: number;
        public methodBody: any;
        public methodDeclaration: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSemantics {
        public semantics: MethodSemanticsAttributes;
        public method: number;
        public association: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSpec {
        public method: any;
        public instantiation: TypeReference[];
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSpecSig {
        public blob: any;
        constructor(blob: any);
    }
    class ModuleRef {
        public name: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class NestedClass {
        public nestedClass: number;
        public enclosingClass: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class PropertyMap {
        public parent: number;
        public propertyList: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class StandAloneSig {
        public signatureBlob: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class TypeSpec {
        public definition: TypeReference;
        public internalReadRow(reader: TableStreamReader): void;
    }
}
declare module pe.managed2 {
    /**
    * Global environment context for loading assemblies.
    * Avoids singletons.
    */
    class AppDomain {
        public assemblies: Assembly[];
        /**
        * There always have to be mscorlib.
        * It has to exist for many things to work correctly. If one gets loaded later, it will assume the already created identity.
        */
        public mscorlib: Assembly;
        constructor();
        /**
        * Read assembly in AppDomain from a binary stream.
        */
        public read(reader: pe.io.BufferReader): Assembly;
        /**
        * Resolve assembly from already loaded ones.
        * If none exist, create a dummy one and return.
        */
        public resolveAssembly(name: string, version: string, publicKey: string, culture: string): Assembly;
    }
    class Assembly {
        public fileHeaders: pe.headers.PEFileHeaders;
        public name: string;
        public version: string;
        public publicKey: string;
        public culture: string;
        public attributes: metadata.AssemblyFlags;
        /**
        * Assemblies may be created speculatively to represent referenced, but not loaded assemblies.
        * The most common case is mscorlib, which almost always needs to exist, but not necessarily will be loaded first.
        * A speculatively-created assembly can get their true content populated later, if it's loaded properly.
        */
        public isSpeculative: boolean;
        public runtimeVersion: string;
        public specificRuntimeVersion: string;
        public imageFlags: metadata.ClrImageFlags;
        public metadataVersion: string;
        public tableStreamVersion: string;
        public generation: number;
        public moduleName: string;
        public mvid: string;
        public encId: string;
        public encBaseId: string;
        public types: Type[];
        public referencedAssemblies: Assembly[];
        public customAttributes: any[];
        public toString(): string;
    }
    /**
    * Implemented by Type, ConstructedGenericType.
    */
    interface TypeReference {
        getBaseType(): TypeReference;
        getAssembly(): Assembly;
        getFullName(): string;
    }
    /**
    * Represents actual types, as well as referenced types from external libraries that aren't loaded
    * (in which case isSpeculative property is set to true).
    */
    class Type implements TypeReference {
        public baseType: TypeReference;
        public assembly: Assembly;
        public namespace: string;
        public name: string;
        /** If an assembly is loaded, and a type from another assembly is required,
        * but that external assembly is not loaded yet,
        * that assembly and required types in it is created speculatively.
        * IF at any point later that assembly is loaded, it will populate an existing speculative assembly
        * and speculative types, rather than creating new distinct instances.
        */
        public isSpeculative: boolean;
        public attributes: metadata.TypeAttributes;
        public fields: FieldInfo[];
        public methods: MethodInfo[];
        public properties: PropertyInfo[];
        public events: EventInfo[];
        public customAttributes: any;
        constructor(baseType?: TypeReference, assembly?: Assembly, namespace?: string, name?: string);
        public getBaseType(): TypeReference;
        public getAssembly(): Assembly;
        public getFullName(): string;
        public toString(): string;
    }
    class ConstructedGenericType implements TypeReference {
        public genericType: TypeReference;
        public genericArguments: TypeReference[];
        constructor(genericType: TypeReference, genericArguments: TypeReference[]);
        public getBaseType(): TypeReference;
        public getAssembly(): Assembly;
        public getFullName(): string;
        public toString(): string;
    }
    class FieldInfo {
        public attributes: metadata.FieldAttributes;
        public name: string;
        public fieldType: TypeReference;
        public toString(): string;
    }
    class PropertyInfo {
        public name: string;
        public propertyType: TypeReference;
        public getAccessor: MethodInfo;
        public setAccessor: MethodInfo;
    }
    class MethodInfo {
        public name: string;
    }
    class ParameterInfo {
        public name: string;
        public parameterType: TypeReference;
    }
    class EventInfo {
        public name: string;
        public addHandler: MethodInfo;
        public removeHandler: MethodInfo;
    }
    /**
    * All the messy raw CLR structures, with indices, GUIDs etc.
    * This is meant to be exposed from Assembly too (for digging in details when needed),
    * but not prominently.
    */
    class ManagedHeaders {
        public clrDirectory: ClrDirectory;
        public clrMetadata: ClrMetadata;
        public metadataStreams: MetadataStreams;
        public tableStream: TableStream;
    }
    class ClrDirectory {
        private static _clrHeaderSize;
        public cb: number;
        public runtimeVersion: string;
        public imageFlags: metadata.ClrImageFlags;
        public metadataDir: pe.io.AddressRange;
        public entryPointToken: number;
        public resourcesDir: pe.io.AddressRange;
        public strongNameSignatureDir: pe.io.AddressRange;
        public codeManagerTableDir: pe.io.AddressRange;
        public vtableFixupsDir: pe.io.AddressRange;
        public exportAddressTableJumpsDir: pe.io.AddressRange;
        public managedNativeHeaderDir: pe.io.AddressRange;
        public read(readerAtClrDataDirectory: pe.io.BufferReader): void;
    }
    class ClrMetadata {
        public mdSignature: metadata.ClrMetadataSignature;
        public metadataVersion: string;
        public runtimeVersion: string;
        public mdReserved: number;
        public mdFlags: number;
        public streamCount: number;
        public read(clrDirReader: pe.io.BufferReader): void;
    }
    class MetadataStreams {
        public guids: string[];
        public strings: pe.io.AddressRange;
        public blobs: pe.io.AddressRange;
        public tables: pe.io.AddressRange;
        public read(metadataBaseAddress: number, streamCount: number, reader: pe.io.BufferReader): void;
        private _readAlignedNameString(reader);
        private _readGuidForStream(reader);
    }
    class TableStream {
        public reserved0: number;
        public version: string;
        public heapSizes: number;
        public reserved1: number;
        public tables: any[][];
        public stringIndices: string[];
        public allTypes: Type[];
        public allFields: FieldInfo[];
        public allMethods: MethodInfo[];
        public allParameters: ParameterInfo[];
        public read(reader: pe.io.BufferReader, stringCount: number, guidCount: number, blobCount: number): void;
        private _readTableRowCounts(valid, tableReader);
        private _populateApiObjects(tableCounts);
        private _populateTableObjects(table, Ctor, count, apiTable?);
        private _populateTableTypes();
        private _populateTableRows(tableCounts, tableTypes);
        private _readTableRows(tableCounts, tableTypes, reader);
    }
    module metadata {
        enum ClrImageFlags {
            ILOnly = 0x00000001,
            _32BitRequired = 0x00000002,
            ILLibrary = 0x00000004,
            StrongNameSigned = 0x00000008,
            NativeEntryPoint = 0x00000010,
            TrackDebugData = 0x00010000,
            IsIbcoptimized = 0x00020000,
        }
        enum ClrMetadataSignature {
            Signature = 0x424a5342,
        }
        enum AssemblyHashAlgorithm {
            None = 0x0000,
            Reserved = 0x8003,
            Sha1 = 0x8004,
        }
        enum AssemblyFlags {
            PublicKey = 0x0001,
            Retargetable = 0x0100,
            DisableJITcompileOptimizer = 0x4000,
            EnableJITcompileTracking = 0x8000,
        }
        enum ElementType {
            End = 0x00,
            Void = 0x01,
            Boolean = 0x02,
            Char = 0x03,
            I1 = 0x04,
            U1 = 0x05,
            I2 = 0x06,
            U2 = 0x07,
            I4 = 0x08,
            U4 = 0x09,
            I8 = 0x0a,
            U8 = 0x0b,
            R4 = 0x0c,
            R8 = 0x0d,
            String = 0x0e,
            Ptr = 0x0f,
            ByRef = 0x10,
            ValueType = 0x11,
            Class = 0x12,
            Var = 0x13,
            Array = 0x14,
            GenericInst = 0x15,
            TypedByRef = 0x16,
            I = 0x18,
            U = 0x19,
            FnPtr = 0x1b,
            Object = 0x1c,
            SZArray = 0x1d,
            MVar = 0x1e,
            CMod_ReqD = 0x1f,
            CMod_Opt = 0x20,
            Internal = 0x21,
            Modifier = 0x40,
            Sentinel,
            Pinned,
            R4_Hfa,
            R8_Hfa,
            ArgumentType_,
            CustomAttribute_BoxedObject_,
            CustomAttribute_Field_,
            CustomAttribute_Property_,
            CustomAttribute_Enum_ = 0x55,
        }
        enum SecurityAction {
            Assert = 3,
            Demand = 2,
            Deny = 4,
            InheritanceDemand = 7,
            LinkDemand = 6,
            NonCasDemand = 0,
            NonCasLinkDemand = 0,
            PrejitGrant = 0,
            PermitOnly = 5,
            RequestMinimum = 8,
            RequestOptional = 9,
            RequestRefuse = 10,
        }
        enum EventAttributes {
            SpecialName = 0x0200,
            RTSpecialName = 0x0400,
        }
        enum TypeAttributes {
            VisibilityMask = 0x00000007,
            NotPublic = 0x00000000,
            Public = 0x00000001,
            NestedPublic = 0x00000002,
            NestedPrivate = 0x00000003,
            NestedFamily = 0x00000004,
            NestedAssembly = 0x00000005,
            NestedFamANDAssem = 0x00000006,
            NestedFamORAssem = 0x00000007,
            LayoutMask = 0x00000018,
            AutoLayout = 0x00000000,
            SequentialLayout = 0x00000008,
            ExplicitLayout = 0x00000010,
            ClassSemanticsMask = 0x00000020,
            Class = 0x00000000,
            Interface = 0x00000020,
            Abstract = 0x00000080,
            Sealed = 0x00000100,
            SpecialName = 0x00000400,
            Import = 0x00001000,
            Serializable = 0x00002000,
            StringFormatMask = 0x00030000,
            AnsiClass = 0x00000000,
            UnicodeClass = 0x00010000,
            AutoClass = 0x00020000,
            CustomFormatClass = 0x00030000,
            CustomStringFormatMask = 0x00C00000,
            BeforeFieldInit = 0x00100000,
            RTSpecialName = 0x00000800,
            HasSecurity = 0x00040000,
            IsTypeForwarder = 0x00200000,
        }
        enum FieldAttributes {
            FieldAccessMask = 0x0007,
            CompilerControlled = 0x0000,
            Private = 0x0001,
            FamANDAssem = 0x0002,
            Assembly = 0x0003,
            Family = 0x0004,
            FamORAssem = 0x0005,
            Public = 0x0006,
            Static = 0x0010,
            InitOnly = 0x0020,
            Literal = 0x0040,
            NotSerialized = 0x0080,
            SpecialName = 0x0200,
            PInvokeImpl = 0x2000,
            RTSpecialName = 0x0400,
            HasFieldMarshal = 0x1000,
            HasDefault = 0x8000,
            HasFieldRVA = 0x0100,
        }
        enum FileAttributes {
            ContainsMetaData = 0x0000,
            ContainsNoMetaData = 0x0001,
        }
        enum GenericParamAttributes {
            VarianceMask = 0x0003,
            None = 0x0000,
            Covariant = 0x0001,
            Contravariant = 0x0002,
            SpecialConstraintMask = 0x001C,
            ReferenceTypeConstraint = 0x0004,
            NotNullableValueTypeConstraint = 0x0008,
            DefaultConstructorConstraint = 0x0010,
        }
        enum PInvokeAttributes {
            NoMangle = 0x0001,
            CharSetMask = 0x0006,
            CharSetNotSpec = 0x0000,
            CharSetAnsi = 0x0002,
            CharSetUnicode = 0x0004,
            CharSetAuto = 0x0006,
            SupportsLastError = 0x0040,
            CallConvMask = 0x0700,
            CallConvPlatformapi = 0x0100,
            CallConvCdecl = 0x0200,
            CallConvStdcall = 0x0300,
            CallConvThiscall = 0x0400,
            CallConvFastcall = 0x0500,
        }
        enum ManifestResourceAttributes {
            VisibilityMask = 0x0007,
            Public = 0x0001,
            Private = 0x0002,
        }
        enum MethodImplAttributes {
            CodeTypeMask = 0x0003,
            IL = 0x0000,
            Native = 0x0001,
            OPTIL = 0x0002,
            Runtime = 0x0003,
            ManagedMask = 0x0004,
            Unmanaged = 0x0004,
            Managed = 0x0000,
            ForwardRef = 0x0010,
            PreserveSig = 0x0080,
            InternalCall = 0x1000,
            Synchronized = 0x0020,
            NoInlining = 0x0008,
            MaxMethodImplVal = 0xffff,
            NoOptimization = 0x0040,
        }
        enum MethodAttributes {
            MemberAccessMask = 0x0007,
            CompilerControlled = 0x0000,
            Private = 0x0001,
            FamANDAssem = 0x0002,
            Assem = 0x0003,
            Family = 0x0004,
            FamORAssem = 0x0005,
            Public = 0x0006,
            Static = 0x0010,
            Final = 0x0020,
            Virtual = 0x0040,
            HideBySig = 0x0080,
            VtableLayoutMask = 0x0100,
            ReuseSlot = 0x0000,
            NewSlot = 0x0100,
            Strict = 0x0200,
            Abstract = 0x0400,
            SpecialName = 0x0800,
            PInvokeImpl = 0x2000,
            UnmanagedExport = 0x0008,
            RTSpecialName = 0x1000,
            HasSecurity = 0x4000,
            RequireSecObject = 0x8000,
        }
        enum MethodSemanticsAttributes {
            Setter = 0x0001,
            Getter = 0x0002,
            Other = 0x0004,
            AddOn = 0x0008,
            RemoveOn = 0x0010,
            Fire = 0x0020,
        }
        enum ParamAttributes {
            In = 0x0001,
            Out = 0x0002,
            Optional = 0x0010,
            HasDefault = 0x1000,
            HasFieldMarshal = 0x2000,
            Unused = 0xcfe0,
        }
        enum PropertyAttributes {
            SpecialName = 0x0200,
            RTSpecialName = 0x0400,
            HasDefault = 0x1000,
            Unused = 0xe9ff,
        }
        enum CallingConventions {
            Default = 0x0,
            C = 0x1,
            StdCall = 0x2,
            FastCall = 0x4,
            VarArg = 0x5,
            Generic = 0x10,
            HasThis = 0x20,
            ExplicitThis = 0x40,
            Sentinel = 0x41,
        }
        enum TableKind {
            ModuleDefinition = 0x00,
            ExternalType = 0x01,
            TypeDefinition = 0x02,
            FieldDefinition = 0x04,
            MethodDefinition = 0x06,
            ParameterDefinition = 0x08,
            MemberRef = 0x0A,
            Constant = 0x0B,
            CustomAttribute = 0x0C,
            FieldMarshal = 0x0D,
            DeclSecurity = 0x0E,
            ClassLayout = 0x0F,
            InterfaceImpl = 0x09,
            FieldLayout = 0x10,
            StandAloneSig = 0x11,
            EventMap = 0x12,
            Event = 0x14,
            PropertyMap = 0x15,
            PropertyDefinition = 0x17,
            MethodSemantics = 0x18,
            MethodImpl = 0x19,
            ModuleRef = 0x1A,
            TypeSpec = 0x1B,
            ImplMap = 0x1C,
            FieldRVA = 0x1D,
            AssemblyDefinition = 0x20,
            AssemblyProcessor = 0x21,
            AssemblyOS = 0x22,
            AssemblyRef = 0x23,
            AssemblyRefProcessor = 0x24,
            AssemblyRefOS = 0x25,
            File = 0x26,
            ExportedType = 0x27,
            ManifestResource = 0x28,
            NestedClass = 0x29,
            GenericParam = 0x2A,
            MethodSpec = 0x2B,
            GenericParamConstraint = 0x2C,
        }
    }
}
declare module pe {
    class LoaderContext {
        public loaded: PEFile[];
        public beginRead(path: string): LoaderContext.FileReader;
    }
    module LoaderContext {
        class FileReader {
            public path: string;
            public size: number;
            public buffer: Uint32Array;
            private _parsePhase;
            constructor(path: string);
            public parseNext(): number;
        }
    }
    interface PEFile {
        path: string;
        dosHeader: pe.headers.DosHeader;
        dosStub: Uint8Array;
        peHeader: pe.headers.PEHeader;
        optionalHeader: pe.headers.OptionalHeader;
        sectionHeaders: pe.headers.SectionHeader[];
    }
}
