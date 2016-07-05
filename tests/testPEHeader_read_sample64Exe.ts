namespace tests.PEHeader_read_sample64Exe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);
	}

	export function read_pe_PE() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pe !== pe.headers.PESignature.PE)
			throw peh.pe;
	}

	export function read_machine_AMD64() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.machine !== pe.headers.Machine.AMD64)
			throw peh.machine;
	}

	export function read_numberOfSections_2() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSections !== 2)
			throw peh.numberOfSections;
	}

	export function read_timestamp_2012Dec6_220520() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		var expectedDate = new Date(
			2012, 11, 6,
			22, 05, 20);

		if (peh.timestamp.getTime() !== expectedDate.getTime())
			throw peh.timestamp + " expected " + expectedDate;
	}

	export function read_pointerToSymbolTable_0() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pointerToSymbolTable !== 0)
			throw peh.pointerToSymbolTable;
	}

	export function read_numberOfSymbols_0() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSymbols !== 0)
			throw peh.numberOfSymbols;
	}

	export function read_sizeOfOptionalHeader_240() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.sizeOfOptionalHeader !== 240)
			throw peh.sizeOfOptionalHeader;
	}

	export function read_characteristics_LargeAddressAwareExecutableImage() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes); bi.offset = 128;
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		var expected = pe.headers.ImageCharacteristics.LargeAddressAware | pe.headers.ImageCharacteristics.ExecutableImage;

		if (peh.characteristics !== expected)
			throw peh.characteristics + " expected " + expected;
	}
}