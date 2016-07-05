declare var monoCorlib: ArrayBuffer;

namespace tests.TableStream_read_monoCorlibDll {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);
	}

	export function modules_length_1() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);


		if (tas.tables[pe.managed.metadata.TableKind.Module].length !== 1)
			throw tas.tables[pe.managed.metadata.TableKind.Module].length;
	}

	export function modules_0_name_mscorlibDll() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];
    var moduleName = tas.stringIndices[_module.name];

		if (moduleName !== "mscorlib.dll")
			throw moduleName;
	}

	export function modules_0_generation_0() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

		if (_module.generation !== 0)
			throw _module.generation;
	}

	export function modules_0_mvid_5f771c4d459bd228469487b532184ce5() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];
    var mvid = mes.guids[_module.mvid];

		if (mvid !== "{5f771c4d459bd228469487b532184ce5}")
			throw mvid;
	}

	export function modules_0_encId_null() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

		if (_module.encId !== null)
			throw _module.encId;
	}

	export function modules_0_encBaseId_null() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var _module = tas.tables[pe.managed.metadata.TableKind.Module][0];

		if (_module.encBaseId !== null)
			throw _module.encBaseId;
	}

	export function typeRefs_empty() {
		var bi = new pe.io.BufferReader(monoCorlib);
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

		bi.setVirtualOffset(mes.tables.address);
		var tas = new pe.managed.metadata.TableStream();
		tas.read(bi, mes.strings.size, mes.guids.length, mes.blobs.size);

		var typeRefs = tas.tables[pe.managed.metadata.TableKind.TypeRef];

		if (typeRefs.length)
			throw typeRefs.length;
	}
}