namespace tests.MetadataStreams_read_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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

	export function read_guids_0_0d9cc7924913ca5a188f769e27c2bc72() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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

		if (mes.guids[0] !== "{0d9cc7924913ca5a188f769e27c2bc72}")
			throw mes.guids[0];
	}

	export function read_strings_toString_21B8_B8h() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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

		if (mes.strings + "" !== "21B8:B8h")
			throw mes.strings;
	}

	export function read_blobs_toString_22A0_44h() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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

		if (mes.blobs + "" !== "22A0:44h")
			throw mes.blobs;
	}

	export function read_tables_toString_20D4_E4h() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
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