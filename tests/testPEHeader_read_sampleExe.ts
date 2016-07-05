namespace tests.PEHeader_read_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);
	}

	export function read_pe_PE() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pe !== pe.headers.PESignature.PE)
			throw peh.pe;
	}

	export function read_machine_I386() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.machine !== pe.headers.Machine.I386)
			throw peh.machine;
	}

	export function read_numberOfSections_3() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSections !== 3)
			throw peh.numberOfSections;
	}

	export function read_timestamp_2012Nov5_093251() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		var expectedDate = new Date(
			2012, 10, 5,
			9, 32, 51);

		if (peh.timestamp.getTime() !== expectedDate.getTime())
			throw peh.timestamp + " expected " + expectedDate;
	}

	export function read_pointerToSymbolTable_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pointerToSymbolTable !== 0)
			throw peh.pointerToSymbolTable;
	}

	export function read_numberOfSymbols_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSymbols !== 0)
			throw peh.numberOfSymbols;
	}

	export function read_sizeOfOptionalHeader_224() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.sizeOfOptionalHeader !== 224)
			throw peh.sizeOfOptionalHeader;
	}

	export function read_characteristics_Bit32MachineExecutableImage() {
		var bi = new pe.io.BufferReader(sampleExe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		var expected = pe.headers.ImageCharacteristics.Bit32Machine | pe.headers.ImageCharacteristics.ExecutableImage;

		if (peh.characteristics !== expected)
			throw peh.characteristics + " expected " + expected;
	}
}