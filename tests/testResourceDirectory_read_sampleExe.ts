namespace tests.ResourceDirectory_read_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);
	}

	export function read_characteristics_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.characteristics !== 0)
			throw redi.characteristics;
	}

	export function read_version_00() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.version !== "0.0")
			throw redi.version;
	}

	export function read_subdirectories_length_1() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories.length !== 1)
			throw redi.subdirectories.length;
	}

	export function read_dataEntries_length_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.dataEntries.length !== 0)
			throw redi.dataEntries.length;
	}

	export function read_subdirectories_0_name_null() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].name !== null)
			throw redi.subdirectories[0].name;
	}

	export function read_subdirectories_0_integerId_16() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].integerId !== 16)
			throw redi.subdirectories[0].integerId;
	}

	export function read_subdirectories_0_directory_notNull() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory === null)
			throw redi.subdirectories[0].directory;
	}

	export function read_subdirectories_0_directory_characteristics_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.characteristics !== 0)
			throw redi.subdirectories[0].directory.characteristics;
	}

	export function read_subdirectories_0_directory_version_00() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.version !== "0.0")
			throw redi.subdirectories[0].directory.version;
	}

	export function read_subdirectories_0_directory_subdirectories_length_1() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories.length !== 1)
			throw redi.subdirectories[0].directory.subdirectories;
	}

	export function read_subdirectories_0_directory_dataEntries_length_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.dataEntries.length !== 0)
			throw redi.subdirectories[0].directory.dataEntries;
	}

	export function read_subdirectories_0_directory_subdirectories_0_name_null() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].name !== null)
			throw redi.subdirectories[0].directory.subdirectories[0].name;
	}

	export function read_subdirectories_0_directory_subdirectories_0_integerId_1() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].integerId !== 1)
			throw redi.subdirectories[0].directory.subdirectories[0].integerId;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_notNull() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory === null)
			throw redi.subdirectories[0].directory.subdirectories[0].directory;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_characteristics_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.characteristics !== 0)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.characteristics;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_version_00() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.version !== "0.0")
			throw redi.subdirectories[0].directory.subdirectories[0].directory.version;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_subdirectories_length_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.subdirectories.length !== 0)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.subdirectories.length;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_length_1() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries.length !== 1)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries.length;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_name_null() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].name !== null)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].name;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_integerId_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].integerId !== 0)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].integerId;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_dataRva_16472() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].dataRva !== 16472)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].dataRva;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_size_580() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].size !== 580)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].size;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_codepage_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].codepage !== 0)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].codepage;
	}

	export function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_reserved_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);

		var redi = new pe.unmanaged.ResourceDirectory();
		redi.read(bi);

		if (redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].reserved !== 0)
			throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].reserved;
	}
}