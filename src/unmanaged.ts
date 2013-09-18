/// <reference path="headers.ts" />
/// <reference path="io.ts" />

module pe.unmanaged {

	export class DllExport {
		name: string;
		ordinal: number;

		// The address of the exported symbol when loaded into memory, relative to the image base.
		// For example, the address of an exported function.
		exportRva: number;

		// Null-terminated ASCII string in the export section.
		// This string must be within the range that is given by the export table data directory entry.
		// This string gives the DLL name and the name of the export (for example, "MYDLL.expfunc")
		// or the DLL name and the ordinal number of the export (for example, "MYDLL.#27").
		forwarder: string;

		static readExports(reader: io.BufferReader, range: io.AddressRange): DllExports {
			var result: DllExports = <any>[];

			result.flags = reader.readInt();
			if (!result.timestamp)
				result.timestamp = new Date(0);

			result.timestamp.setTime(reader.readInt() * 1000);
			
			var majorVersion = reader.readShort();
			var minorVersion = reader.readShort();
			result.version = majorVersion + "." + minorVersion;

			// need to read string from that RVA later
			var nameRva = reader.readInt();
				
			result.ordinalBase = reader.readInt();

			// The number of entries in the export address table.
			var addressTableEntries = reader.readInt();

			// The number of entries in the name pointer table. This is also the number of entries in the ordinal table.
			var numberOfNamePointers = reader.readInt();

			// The address of the export address table, relative to the image base.
			var exportAddressTableRva = reader.readInt();

			// The address of the export name pointer table, relative to the image base.
			// The table size is given by the Number of Name Pointers field.
			var namePointerRva = reader.readInt();

			// The address of the ordinal table, relative to the image base.
			var ordinalTableRva = reader.readInt();

			if (nameRva == 0) {
				result.dllName = null;
			}
			else {
				var saveOffset = reader.offset;
				reader.setVirtualOffset(nameRva);
				result.dllName = reader.readAsciiZ();
				reader.offset = saveOffset;
			}

			result.length = addressTableEntries;

			for (var i = 0; i < addressTableEntries; i++) {
				var exportEntry = new DllExport();
				exportEntry.readExportEntry(reader, range);
				exportEntry.ordinal = i + result.ordinalBase;
				result[i] = exportEntry;
			}

			if (numberOfNamePointers != 0
				&& namePointerRva != 0
				&& ordinalTableRva != 0) {
					
				saveOffset = reader.offset;
				for (var i = 0; i < numberOfNamePointers; i++) {
					reader.setVirtualOffset(ordinalTableRva + 2 * i);
					var ordinal = reader.readShort();

					reader.setVirtualOffset(namePointerRva + 4 * i);
					var functionNameRva = reader.readInt();

					var functionName: string;
					if (functionNameRva == 0) {
						functionName = null;
					}
					else {
						reader.setVirtualOffset(functionNameRva);
						functionName = reader.readAsciiZ();
					}

					result[ordinal].name = functionName;
				}
				reader.offset = saveOffset;
			}

			return result;
		}

		private readExportEntry(reader: io.BufferReader, range: io.AddressRange) {
			var exportOrForwarderRva = reader.readInt();

			if (range.mapRelative(exportOrForwarderRva) >= 0) {
				this.exportRva = 0;

				var forwarderRva = reader.readInt();
				if (forwarderRva == 0) {
					this.forwarder = null;
				}
				else {
					var saveOffset = reader.offset;
					reader.setVirtualOffset(forwarderRva);
					this.forwarder = reader.readAsciiZ();
					reader.offset = saveOffset;
				}
			}
			else {
				this.exportRva = reader.readInt();
				this.forwarder = null;
			}

			this.name = null;
		}
	}

	export interface DllExports {
		length: number;
		[i: number]: DllExport;

		// Reserved, must be 0.
		flags: number;

		// The time and date that the export data was created.
		timestamp: Date;

		// The version number. The major and minor version numbers can be set by the user.
		version: string;
			
		// The ASCII string that contains the name of the DLL. This address is relative to the image base.
		dllName;
			
		// The starting ordinal number for exports in this image.
		// This field specifies the starting ordinal number for the export address table.
		// It is usually set to 1.
		ordinalBase;
	}

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

	export class ResourceDirectory {
		// Resource flags. This field is reserved for future use. It is currently set to zero.
		characteristics: number = 0;

		// The time that the resource data was created by the resource compiler
		timestamp: Date = new Date(0);

		// The version number, set by the user.
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

	export class ResourceDirectoryEntry {
		name: string = "";
		integerId: number = 0;

		directory: ResourceDirectory = new ResourceDirectory();

		toString() {
			return (this.name ? this.name + " " : "") + this.integerId +
				(this.directory ? 
					"[" +
						(this.directory.dataEntries ? this.directory.dataEntries.length : 0) +
						(this.directory.subdirectories ? this.directory.subdirectories.length : 0) +
					"]" :
					"[null]");
		}
	}

	export class ResourceDataEntry {
		name: string = "";
		integerId: number = 0;
		dataRva: number = 0;
		size: number = 0;
		codepage: number = 0;
		reserved: number = 0;

		toString() {
			return (this.name ? this.name + " " : "") + this.integerId;
		}
	}
}