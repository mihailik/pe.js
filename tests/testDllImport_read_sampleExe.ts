namespace tests.DllImport_read_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
		bi.setVirtualOffset(importRange.address);

		pe.unmanaged.DllImport.read(bi);
	}

	export function read_length_1() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
		bi.setVirtualOffset(importRange.address);

		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports.length !== 1)
			throw imports.length;
	}

	export function read_0_dllName_mscoreeDll() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
		bi.setVirtualOffset(importRange.address);

		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].dllName !== "mscoree.dll")
			throw imports[0].dllName;
	}

	export function read_0_name__CorExeMain() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
		bi.setVirtualOffset(importRange.address);

		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].name !== "_CorExeMain")
			throw imports[0].name;
	}

	export function read_0_ordinal_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);

		bi.sections = pef.sectionHeaders;
		var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
		bi.setVirtualOffset(importRange.address);

		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].ordinal !== 0)
			throw imports[0].ordinal;
	}
}