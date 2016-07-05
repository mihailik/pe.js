namespace tests.OptionalHeader_read_NT322345 {

	var sampleBuf = (function () {
		var array = [
			pe.headers.PEMagic.NT32 & 0xFF,
			(pe.headers.PEMagic.NT32 >> 8) & 0xFF];

		for (var i = 0; i < 300; i++) {
			if (typeof(array[i]) === "number")
				continue; // PEMagic.NT32

			array[i] = i;
		}

		array[92] = 1;
		array[93] = 0;
		array[94] = 0;
		array[95] = 0;

		return array;
	})();

	var global = (function () { return this; })();

	if ("ArrayBuffer" in global) {
		var arrb = new ArrayBuffer(sampleBuf.length);
		var vi = new DataView(arrb);
		for (var i = 0; i < sampleBuf.length; i++) {
			vi.setUint8(i, sampleBuf[i]);
		}

		sampleBuf = <any>arrb;
	}

	export var bytes: ArrayBuffer = <any>sampleBuf;


	export function read_succeeds() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);
	}

	export function read_peMagic_NT32() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.peMagic !== pe.headers.PEMagic.NT32)
			throw oph.peMagic;
	}

	export function read_linkerVersion_23() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.linkerVersion !== "2.3")
			throw oph.linkerVersion;
	}

	export function read_sizeOfCode_117835012() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfCode !== 117835012)
			throw oph.sizeOfCode;
	}

	export function read_sizeOfInitializedData_185207048() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfInitializedData !== 185207048)
			throw oph.sizeOfInitializedData;
	}

	export function read_sizeOfUninitializedData_252579084() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfUninitializedData !== 252579084)
			throw oph.sizeOfUninitializedData;
	}

	export function read_addressOfEntryPoint_319951120() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.addressOfEntryPoint !== 319951120)
			throw oph.addressOfEntryPoint;
	}

	export function read_baseOfCode_387323156() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.baseOfCode !== 387323156)
			throw oph.baseOfCode;
	}

	export function read_baseOfData_454695192() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.baseOfData !== 454695192)
			throw oph.baseOfData;
	}

	export function read_imageBase_454695192() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.baseOfData !== 454695192)
			throw oph.baseOfData;
	}

	export function read_sectionAlignment_589439264() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sectionAlignment !== 589439264)
			throw oph.sectionAlignment;
	}

	export function read_fileAlignment_656811300() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.fileAlignment !== 656811300)
			throw oph.fileAlignment;
	}

	export function read_operatingSystemVersion_10536_11050() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.operatingSystemVersion !== "10536.11050")
			throw oph.operatingSystemVersion;
	}

	export function read_imageVersion_11564_12078() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.imageVersion !== "11564.12078")
			throw oph.imageVersion;
	}

	export function read_subsystemVersion_12592_13106() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.subsystemVersion !== "12592.13106")
			throw oph.subsystemVersion;
	}

	export function read_win32VersionValue_926299444() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.win32VersionValue !== 926299444)
			throw oph.win32VersionValue;
	}

	export function read_sizeOfImage_993671480() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfImage !== 993671480)
			throw oph.sizeOfImage;
	}

	export function read_sizeOfHeaders_1061043516() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfHeaders !== 1061043516)
			throw oph.sizeOfHeaders;
	}

	export function read_checkSum_1128415552() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.checkSum !== 1128415552)
			throw oph.checkSum;
	}

	export function read_subsystem_17732() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.subsystem !== 17732)
			throw oph.subsystem;
	}

	export function read_dllCharacteristics_18246() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.dllCharacteristics !== 18246)
			throw oph.dllCharacteristics;
	}

	export function read_sizeOfStackReserve_1263159624() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfStackReserve !== 1263159624)
			throw oph.sizeOfStackReserve;
	}

	export function read_sizeOfStackCommit_1330531660() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfStackCommit !== 1330531660)
			throw oph.sizeOfStackCommit;
	}

	export function read_sizeOfHeapReserve_1397903696() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfHeapReserve !== 1397903696)
			throw oph.sizeOfHeapReserve;
	}

	export function read_sizeOfHeapCommit_1465275732() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.sizeOfHeapCommit !== 1465275732)
			throw oph.sizeOfHeapCommit;
	}

	export function read_loaderFlags_1532647768() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.loaderFlags !== 1532647768)
			throw oph.loaderFlags;
	}

	export function read_numberOfRvaAndSizes_1() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.numberOfRvaAndSizes !== 1)
			throw oph.numberOfRvaAndSizes;
	}

	export function read_dataDirectories_length_1() {
		var bi = new pe.io.BufferReader(bytes);
		var oph = new pe.headers.OptionalHeader();
		oph.read(bi);

		if (oph.dataDirectories.length !== 1)
			throw oph.dataDirectories.length;
	}
}