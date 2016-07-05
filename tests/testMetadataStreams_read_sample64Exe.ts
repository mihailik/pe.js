namespace tests.MetadataStreams_read_sample64Exe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);
	}

	export function read_guids_length_1() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);

		if (mes.guids.length !== 1)
			throw mes.guids.length;
	}

	export function read_guids_0_6147adca4753401f7faf138abeb52b54() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);

		if (mes.guids[0] !== "{6147adca4753401f7faf138abeb52b54}")
			throw mes.guids[0];
	}

	export function read_strings_toString_21B8_BCh() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);

		if (mes.strings + "" !== "21B8:BCh")
			throw mes.strings;
	}

	export function read_blobs_toString_22A4_44h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);

		if (mes.blobs + "" !== "22A4:44h")
			throw mes.blobs;
	}

	export function read_tables_toString_20D4_E4h() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var pef = new pe.headers.PEFileHeaders();
		pef.read(bi);
		bi.sections = pef.sectionHeaders;
		bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

		var cdi = new pe.managed.metadata.ClrDirectory();
		cdi.read(bi);

		bi.setVirtualOffset(cdi.metadataDir.address);
		var cme = new pe.managed.metadata.ClrMetadata();
		cme.read(bi);

		var mes = new pe.managed.metadata.MetadataStreams();
		mes.read(cdi.metadataDir.address, cme.streamCount, bi);

		if (mes.tables + "" !== "20D4:E4h")
			throw mes.tables;
	}
}