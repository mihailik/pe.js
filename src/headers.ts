/// <reference path="io.ts" />

module pe.headers {

	export class PEFileHeaders {
		dosHeader: DosHeader = new DosHeader();
		dosStub: Uint8Array;
		peHeader: PEHeader = new PEHeader();
		optionalHeader: OptionalHeader = new OptionalHeader();
		sectionHeaders: SectionHeader[] = [];

		toString() {
			var result =
				"dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
				"dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
				"peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " +
				"optionalHeader: " + (this.optionalHeader ? "[" + io.formatEnum(this.optionalHeader.subsystem, Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
				"sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
			return result;
		}

		read(reader: io.BufferReader) {
			var dosHeaderSize: number = 64;

			if (!this.dosHeader)
				this.dosHeader = new DosHeader();
			this.dosHeader.read(reader);

			var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
			if (dosHeaderLength > 0)
				this.dosStub = reader.readBytes(dosHeaderLength);
			else
				this.dosStub = null;

			if (!this.peHeader)
				this.peHeader = new PEHeader();
			this.peHeader.read(reader);

			if (!this.optionalHeader)
				this.optionalHeader = new OptionalHeader();
			this.optionalHeader.read(reader);

			if (this.peHeader.numberOfSections > 0) {
				if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
					this.sectionHeaders = Array(this.peHeader.numberOfSections);

				for (var i = 0; i < this.sectionHeaders.length; i++) {
					if (!this.sectionHeaders[i])
						this.sectionHeaders[i] = new SectionHeader();
					this.sectionHeaders[i].read(reader);
				}
			}
		}
	}

	export class DosHeader {
		mz: MZSignature = MZSignature.MZ;

		// Bytes on last page of file.
		cblp: number = 144;

		// Pages in file.
		cp: number = 3;

		// Relocations.
		crlc: number = 0;

		// Size of header in paragraphs.
		cparhdr: number = 4;

		// Minimum extra paragraphs needed.
		minalloc: number = 0;

		// Maximum extra paragraphs needed.
		maxalloc: number = 65535;

		// Initial (relative) SS value.
		ss: number = 0;

		// Initial SP value.
		sp: number = 184;

		// Checksum.
		csum: number = 0;

		// Initial IP value.
		ip: number = 0;

		// Initial (relative) CS value.
		cs: number = 0;

		// File address of relocation table.
		lfarlc: number = 64;

		// Overlay number.
		ovno: number = 0;

		res1: io.Long = new io.Long(0, 0);

		// OEM identifier (for e_oeminfo).
		oemid: number = 0;

		// OEM information: number; e_oemid specific.
		oeminfo: number = 0;

		reserved: number[] = [0, 0, 0, 0, 0]; // uint[5]

		// uint: File address of PE header.
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

	export enum MZSignature {
		MZ =
			"M".charCodeAt(0) +
			("Z".charCodeAt(0) << 8)
	}

	export class PEHeader {
		pe: PESignature = PESignature.PE;

		// The architecture type of the computer.
		// An image file can only be run on the specified computer or a system that emulates the specified computer.
		machine: Machine = Machine.I386;

		//  UShort. Indicates the size of the section table, which immediately follows the headers.
		//  Note that the Windows loader limits the number of sections to 96.
		numberOfSections: number = 0;

		// The low 32 bits of the time stamp of the image.
		// This represents the date and time the image was created by the linker.
		// The value is represented in the number of seconds elapsed since
		// midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
		// according to the system clock.
		timestamp: Date = new Date(0);

		// UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
		pointerToSymbolTable: number = 0;

		// UInt. The number of symbols in the symbol table.
		numberOfSymbols: number = 0;

		// UShort. The size of the optional header, in bytes. This value should be 0 for object files.
		sizeOfOptionalHeader: number = 0;

		// The characteristics of the image.
		characteristics: ImageCharacteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;

		toString() {
			var result =
				io.formatEnum(this.machine, Machine) + " " +
				io.formatEnum(this.characteristics, ImageCharacteristics) + " " +
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

	export enum PESignature {
		PE =
			"P".charCodeAt(0) +
			("E".charCodeAt(0) << 8)
	}

	export enum Machine {
		// The target CPU is unknown or not specified.
		Unknown = 0x0000,

		// Intel 386.
		I386 = 0x014C,

		// MIPS little-endian
		R3000 = 0x0162,

		// MIPS little-endian
		R4000 = 0x0166,

		// MIPS little-endian
		R10000 = 0x0168,

		// MIPS little-endian WCE v2
		WCEMIPSV2 = 0x0169,

		// Alpha_AXP
		Alpha = 0x0184,

		// SH3 little-endian
		SH3 = 0x01a2,

		// SH3 little-endian. DSP.
		SH3DSP = 0x01a3,

		// SH3E little-endian.
		SH3E = 0x01a4,

		// SH4 little-endian.
		SH4 = 0x01a6,

		// SH5.
		SH5 = 0x01a8,

		// ARM Little-Endian
		ARM = 0x01c0,

		// Thumb.
		Thumb = 0x01c2,

		// AM33
		AM33 = 0x01d3,

		// IBM PowerPC Little-Endian
		PowerPC = 0x01F0,

		// PowerPCFP
		PowerPCFP = 0x01f1,

		// Intel 64
		IA64 = 0x0200,

		// MIPS
		MIPS16 = 0x0266,

		// ALPHA64
		Alpha64 = 0x0284,

		// MIPS
		MIPSFPU = 0x0366,

		// MIPS
		MIPSFPU16 = 0x0466,

		// AXP64
		AXP64 = Alpha64,

		// Infineon
		Tricore = 0x0520,

		// CEF
		CEF = 0x0CEF,

		// EFI Byte Code
		EBC = 0x0EBC,

		// AMD64 (K8)
		AMD64 = 0x8664,

		// M32R little-endian
		M32R = 0x9041,

		// CEE
		CEE = 0xC0EE,
	}

	export enum ImageCharacteristics {
		// Relocation information was stripped from the file.
		// The file must be loaded at its preferred base address.
		// If the base address is not available, the loader reports an error.
		RelocsStripped = 0x0001,

		// The file is executable (there are no unresolved external references).
		ExecutableImage = 0x0002,

		// COFF line numbers were stripped from the file.
		LineNumsStripped = 0x0004,

		// COFF symbol table entries were stripped from file.
		LocalSymsStripped = 0x0008,

		// Aggressively trim the working set.
		// This value is obsolete as of Windows 2000.
		AggressiveWsTrim = 0x0010,

		// The application can handle addresses larger than 2 GB.
		LargeAddressAware = 0x0020,

		// The bytes of the word are reversed. This flag is obsolete.
		BytesReversedLo = 0x0080,

		// The computer supports 32-bit words.
		Bit32Machine = 0x0100,

		// Debugging information was removed and stored separately in another file.
		DebugStripped = 0x0200,

		// If the image is on removable media, copy it to and run it from the swap file.
		RemovableRunFromSwap = 0x0400,

		// If the image is on the network, copy it to and run it from the swap file.
		NetRunFromSwap = 0x0800,

		// The image is a system file.
		System = 0x1000,

		// The image is a DLL file.
		// While it is an executable file, it cannot be run directly.
		Dll = 0x2000,

		// The file should be run only on a uniprocessor computer.
		UpSystemOnly = 0x4000,

		// The bytes of the word are reversed. This flag is obsolete.
		BytesReversedHi = 0x8000
	}

	export class OptionalHeader {
		peMagic: PEMagic = PEMagic.NT32;

		linkerVersion: string = "";

		// The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
		sizeOfCode: number = 0;

		// The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
		sizeOfInitializedData: number = 0;

		// The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
		sizeOfUninitializedData: number = 0;

		// A pointer to the entry point function, relative to the image base address.
		// For executable files, this is the starting address.
		// For device drivers, this is the address of the initialization function.
		// The entry point function is optional for DLLs.
		// When no entry point is present, this member is zero.
		addressOfEntryPoint: number = 0;

		// A pointer to the beginning of the code section, relative to the image base.
		baseOfCode: number = 0x2000;

		// A pointer to the beginning of the data section, relative to the image base.
		baseOfData: number = 0x4000;

		// Uint or 64-bit long.
		// The preferred address of the first byte of the image when it is loaded in memory.
		// This value is a multiple of 64K bytes.
		// The default value for DLLs is 0x10000000.
		// The default value for applications is 0x00400000,
		// except on Windows CE where it is 0x00010000.
		imageBase: any = 0x4000;

		// The alignment of sections loaded in memory, in bytes.
		// This value must be greater than or equal to the FileAlignment member.
		// The default value is the page size for the system.
		sectionAlignment: number = 0x2000;

		// The alignment of the raw data of sections in the image file, in bytes.
		// The value should be a power of 2 between 512 and 64K (inclusive).
		// The default is 512.
		// If the <see cref="SectionAlignment"/> member is less than the system page size,
		// this member must be the same as <see cref="SectionAlignment"/>.
		fileAlignment: number = 0x200;

		// The version of the required operating system.
		operatingSystemVersion: string = "";

		// The version of the image.
		imageVersion: string = "";

		// The version of the subsystem.
		subsystemVersion: string = "";

		// This member is reserved and must be 0.
		win32VersionValue: number = 0;

		// The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
		sizeOfImage: number = 0;

		// The combined size of the MS-DOS stub, the PE header, and the section headers,
		// rounded to a multiple of the value specified in the FileAlignment member.
		sizeOfHeaders: number = 0;

		// The image file checksum.
		// The following files are validated at load time:
		// all drivers,
		// any DLL loaded at boot time,
		// and any DLL loaded into a critical system process.
		checkSum: number = 0;

		// The subsystem required to run this image.
		subsystem: Subsystem = Subsystem.WindowsCUI;

		// The DLL characteristics of the image.
		dllCharacteristics: DllCharacteristics = DllCharacteristics.NxCompatible;

		// Uint or 64 bit long.
		// The number of bytes to reserve for the stack.
		// Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
		// the rest is made available one page at a time until this reserve size is reached.
		sizeOfStackReserve: any = 0x100000;

		// Uint or 64 bit long.
		// The number of bytes to commit for the stack.
		sizeOfStackCommit: any = 0x1000;

		// Uint or 64 bit long.
		// The number of bytes to reserve for the local heap.
		// Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
		// the rest is made available one page at a time until this reserve size is reached.
		sizeOfHeapReserve: any = 0x100000;

		// Uint or 64 bit long.
		// The number of bytes to commit for the local heap.
		sizeOfHeapCommit: any = 0x1000;

		// This member is obsolete.
		loaderFlags: number = 0;

		// The number of directory entries in the remainder of the optional header.
		// Each entry describes a location and size.
		numberOfRvaAndSizes: number = 16;

		dataDirectories: io.AddressRange[] = [];

		toString() {
			var result = [];

			var peMagicText = io.formatEnum(this.peMagic, PEMagic);
			if (peMagicText)
				result.push(peMagicText);
				
			var subsystemText = io.formatEnum(this.subsystem, Subsystem);
			if (subsystemText)
				result.push(subsystemText);

			var dllCharacteristicsText = io.formatEnum(this.dllCharacteristics, DllCharacteristics);
			if (dllCharacteristicsText)
				result.push(dllCharacteristicsText);

			var nonzeroDataDirectoriesText = [];
			if (this.dataDirectories) {
				for (var i = 0; i < this.dataDirectories.length; i++) {
					if (!this.dataDirectories[i] || this.dataDirectories[i].size <= 0)
						continue;

					var kind = io.formatEnum(i, DataDirectoryKind);
					nonzeroDataDirectoriesText.push(kind);
				}
			}

			result.push(
				"dataDirectories[" +
				nonzeroDataDirectoriesText.join(",") + "]");

			var resultText = result.join(" ");

			return resultText;
		}

		read(reader: io.BufferReader) {
			this.peMagic = <PEMagic>reader.readShort();

			if (this.peMagic != PEMagic.NT32
				&& this.peMagic != PEMagic.NT64)
				throw Error("Unsupported PE magic value " + (<number>this.peMagic).toString(16).toUpperCase() + "h.");

			this.linkerVersion = reader.readByte() + "." + reader.readByte();

			this.sizeOfCode = reader.readInt();
			this.sizeOfInitializedData = reader.readInt();
			this.sizeOfUninitializedData = reader.readInt();
			this.addressOfEntryPoint = reader.readInt();
			this.baseOfCode = reader.readInt();

			if (this.peMagic == PEMagic.NT32) {
				this.baseOfData = reader.readInt();
				this.imageBase = reader.readInt();
			}
			else {
				this.imageBase = reader.readLong();
			}

			this.sectionAlignment = reader.readInt();
			this.fileAlignment = reader.readInt();
			this.operatingSystemVersion = reader.readShort() + "." + reader.readShort();
			this.imageVersion = reader.readShort() + "." + reader.readShort();
			this.subsystemVersion = reader.readShort() + "." + reader.readShort();
			this.win32VersionValue = reader.readInt();
			this.sizeOfImage = reader.readInt();
			this.sizeOfHeaders = reader.readInt();
			this.checkSum = reader.readInt();
			this.subsystem = <Subsystem>reader.readShort();
			this.dllCharacteristics = <DllCharacteristics>reader.readShort();

			if (this.peMagic == PEMagic.NT32) {
				this.sizeOfStackReserve = reader.readInt();
				this.sizeOfStackCommit = reader.readInt();
				this.sizeOfHeapReserve = reader.readInt();
				this.sizeOfHeapCommit = reader.readInt();
			}
			else {
				this.sizeOfStackReserve = reader.readLong();
				this.sizeOfStackCommit = reader.readLong();
				this.sizeOfHeapReserve = reader.readLong();
				this.sizeOfHeapCommit = reader.readLong();
			}

			this.loaderFlags = reader.readInt();
			this.numberOfRvaAndSizes = reader.readInt();

			if (this.dataDirectories == null
				|| this.dataDirectories.length != this.numberOfRvaAndSizes)
				this.dataDirectories = <io.AddressRange[]>(Array(this.numberOfRvaAndSizes));

			for (var i = 0; i < this.numberOfRvaAndSizes; i++) {
				if (this.dataDirectories[i]) {
					this.dataDirectories[i].address = reader.readInt();
					this.dataDirectories[i].size = reader.readInt();
				}
				else {
					this.dataDirectories[i] = new io.AddressRange(reader.readInt(), reader.readInt());
				}
			}
		}
	}

	export enum PEMagic {
		NT32 = 0x010B,
		NT64 = 0x020B,
		ROM = 0x107
	}

	export enum Subsystem {
		// Unknown subsystem.
		Unknown = 0,

		// No subsystem required (device drivers and native system processes).
		Native = 1,

		// Windows graphical user interface (GUI) subsystem.
		WindowsGUI = 2,

		// Windows character-mode user interface (CUI) subsystem.
		WindowsCUI = 3,

		// OS/2 console subsystem.
		OS2CUI = 5,

		// POSIX console subsystem.
		POSIXCUI = 7,

		// Image is a native Win9x driver.
		NativeWindows = 8,

		// Windows CE system.
		WindowsCEGUI = 9,

		// Extensible Firmware Interface (EFI) application.
		EFIApplication = 10,

		// EFI driver with boot services.
		EFIBootServiceDriver = 11,

		// EFI driver with run-time services.
		EFIRuntimeDriver = 12,

		// EFI ROM image.
		EFIROM = 13,

		// Xbox system.
		XBOX = 14,

		// Boot application.
		BootApplication = 16
	}

	export enum DllCharacteristics {
		// Reserved.
		ProcessInit = 0x0001,

		// Reserved.
		ProcessTerm = 0x0002,

		// Reserved.
		ThreadInit = 0x0004,

		// Reserved.
		ThreadTerm = 0x0008,

		// The DLL can be relocated at load time.
		DynamicBase = 0x0040,


		// Code integrity checks are forced.
		// If you set this flag and a section contains only uninitialized data,
		// set the PointerToRawData member of IMAGE_SECTION_HEADER
		// for that section to zero;
		// otherwise, the image will fail to load because the digital signature cannot be verified.
		ForceIntegrity = 0x0080,

		// The image is compatible with data execution prevention (DEP).
		NxCompatible = 0x0100,

		// The image is isolation aware, but should not be isolated.
		NoIsolation = 0x0200,

		// The image does not use structured exception handling (SEH). No SE handler may reside in this image.
		NoSEH = 0x0400,

		// Do not bind this image.
		NoBind = 0x0800,

		// The image must run inside an AppContainer.
		AppContainer = 0x1000,

		// WDM (Windows Driver Model) driver.
		WdmDriver = 0x2000,

		// Reserved (no specific name).
		Reserved = 0x4000,

		// The image is terminal server aware.
		TerminalServerAware = 0x8000,
	}

	export enum DataDirectoryKind {
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
		Clr = 14
	}

	export class SectionHeader extends io.AddressRangeMap {
		// An 8-byte, null-padded UTF-8 string.
		// There is no terminating null character if the string is exactly eight characters long.
		// For longer names, this member contains a forward slash (/)
		// followed by an ASCII representation of a decimal number that is an offset into the string table.
		// Executable images do not use a string table
		// and do not support section names longer than eight characters.
		name: string = "";

		// If virtualSize value is greater than the size member, the section is filled with zeroes.
		// This field is valid only for executable images and should be set to 0 for object files.
		virtualSize: number;

		// A file pointer to the beginning of the relocation entries for the section.
		// If there are no relocations, this value is zero.
		pointerToRelocations: number = 0;

		// A file pointer to the beginning of the line-number entries for the section.
		// If there are no COFF line numbers, this value is zero.
		pointerToLinenumbers: number = 0;

		// Ushort.
		// The number of relocation entries for the section.
		// This value is zero for executable images.
		numberOfRelocations: number = 0;

		// Ushort.
		// The number of line-number entries for the section.
		numberOfLinenumbers: number = 0;

		// The characteristics of the image.
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

	export enum SectionCharacteristics {
		Reserved_0h = 0x00000000,
		Reserved_1h = 0x00000001,
		Reserved_2h = 0x00000002,
		Reserved_4h = 0x00000004,

		// The section should not be padded to the next boundary.
		// This flag is obsolete and is replaced by Align1Bytes.
		NoPadding = 0x00000008,

		Reserved_10h = 0x00000010,

		// The section contains executable code.
		ContainsCode = 0x00000020,

		// The section contains initialized data.
		ContainsInitializedData = 0x00000040,

		// The section contains uninitialized data.
		ContainsUninitializedData = 0x00000080,

		// Reserved.
		LinkerOther = 0x00000100,

		// The section contains comments or other information.
		// This is valid only for object files.
		LinkerInfo = 0x00000200,

		Reserved_400h = 0x00000400,

		// The section will not become part of the image.
		// This is valid only for object files.
		LinkerRemove = 0x00000800,

		// The section contains COMDAT data.
		// This is valid only for object files.
		LinkerCOMDAT = 0x00001000,

		Reserved_2000h = 0x00002000,

		// Reset speculative exceptions handling bits in the TLB entries for this section.
		NoDeferredSpeculativeExecution = 0x00004000,

		// The section contains data referenced through the global pointer.
		GlobalPointerRelative = 0x00008000,

		Reserved_10000h = 0x00010000,

		// Reserved.
		MemoryPurgeable = 0x00020000,

		// Reserved.
		MemoryLocked = 0x00040000,

		// Reserved.
		MemoryPreload = 0x00080000,

		// Align data on a 1-byte boundary.
		// This is valid only for object files.
		Align1Bytes = 0x00100000,

		// Align data on a 2-byte boundary.
		// This is valid only for object files.
		Align2Bytes = 0x00200000,

		// Align data on a 4-byte boundary.
		// This is valid only for object files.
		Align4Bytes = 0x00300000,

		// Align data on a 8-byte boundary.
		// This is valid only for object files.
		Align8Bytes = 0x00400000,

		// Align data on a 16-byte boundary.
		// This is valid only for object files.
		Align16Bytes = 0x00500000,

		// Align data on a 32-byte boundary.
		// This is valid only for object files.
		Align32Bytes = 0x00600000,

		// Align data on a 64-byte boundary.
		// This is valid only for object files.
		Align64Bytes = 0x00700000,

		// Align data on a 128-byte boundary.
		// This is valid only for object files.
		Align128Bytes = 0x00800000,

		// Align data on a 256-byte boundary.
		// This is valid only for object files.
		Align256Bytes = 0x00900000,

		// Align data on a 512-byte boundary.
		// This is valid only for object files.
		Align512Bytes = 0x00A00000,

		// Align data on a 1024-byte boundary.
		// This is valid only for object files.
		Align1024Bytes = 0x00B00000,

		// Align data on a 2048-byte boundary.
		// This is valid only for object files.
		Align2048Bytes = 0x00C00000,

		// Align data on a 4096-byte boundary.
		// This is valid only for object files.
		Align4096Bytes = 0x00D00000,

		// Align data on a 8192-byte boundary.
		// This is valid only for object files.
		Align8192Bytes = 0x00E00000,

		// The section contains extended relocations.
		// The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
		// If the NumberOfRelocations field in the section header is 0xffff,
		// the actual relocation count is stored in the VirtualAddress field of the first relocation.
		// It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
		LinkerRelocationOverflow = 0x01000000,

		// The section can be discarded as needed.
		MemoryDiscardable = 0x02000000,

		// The section cannot be cached.
		MemoryNotCached = 0x04000000,

		// The section cannot be paged.
		MemoryNotPaged = 0x08000000,

		// The section can be shared in memory.
		MemoryShared = 0x10000000,

		// The section can be executed as code.
		MemoryExecute = 0x20000000,

		// The section can be read.
		MemoryRead = 0x40000000,

		// The section can be written to.
		MemoryWrite = 0x80000000
	}
}