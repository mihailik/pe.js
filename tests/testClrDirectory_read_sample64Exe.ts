namespace tests.ClrDirectory_read_sample64Exe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);
	}

	export function cb_72() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.cb !== 72)
			throw cdi.cb;
	}

	export function runtimeVersion_25() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.runtimeVersion !== "2.5")
			throw cdi.runtimeVersion;
	}

	export function imageFlags_ILOnly() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.imageFlags !== pe.managed.metadata.ClrImageFlags.ILOnly)
			throw cdi.imageFlags;
	}

	export function metadataDir_toString_2068_280h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.metadataDir + "" !== "2068:280h")
			throw cdi.metadataDir;
	}

	export function entryPointToken_100663297() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.entryPointToken !== 100663297)
			throw cdi.entryPointToken;
	}

	export function resourcesDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.resourcesDir + "" !== "0:0h")
			throw cdi.resourcesDir;
	}

	export function strongNameSignatureDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.strongNameSignatureDir + "" !== "0:0h")
			throw cdi.strongNameSignatureDir;
	}

	export function codeManagerTableDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.codeManagerTableDir + "" !== "0:0h")
			throw cdi.codeManagerTableDir;
	}

	export function vtableFixupsDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.vtableFixupsDir + "" !== "0:0h")
			throw cdi.vtableFixupsDir;
	}

	export function exportAddressTableJumpsDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.exportAddressTableJumpsDir + "" !== "0:0h")
			throw cdi.exportAddressTableJumpsDir;
	}

	export function managedNativeHeaderDir_toString_00h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		if (cdi.managedNativeHeaderDir + "" !== "0:0h")
			throw cdi.managedNativeHeaderDir;
	}
}