namespace tests.PEHeader_read_PE004567 {

	var sampleBuf: any = (function () {
		var array = [("P").charCodeAt(0), ("E").charCodeAt(0), 0, 0];
		for (var i = 0; i < 1000; i++) {
			if (i < 4)
				continue; // skip PE00

			array[i] = i;
		}
		return array;
	})();

	var global = (function () { return this; })();

	if ("ArrayBuffer" in global) {
		var arrb = new ArrayBuffer(sampleBuf.length);
		var vi = new DataView(arrb);
		for (var i = 0; i < sampleBuf.length; i++) {
			vi.setUint8(i, sampleBuf[i]);
		}

		sampleBuf = arrb;
	}

	export var bytes: ArrayBuffer = sampleBuf;

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);
	}

	export function read_pe_PE() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pe !== pe.headers.PESignature.PE)
			throw peh.pe;
	}

	export function read_machine_1284() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.machine !== 1284)
			throw peh.machine;
	}

	export function read_numberOfSections_1798() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSections !== 1798)
			throw peh.numberOfSections;
	}

	export function read_timestamp_1975Nov14_142408() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		var expectedDate = new Date(
			1975, 10, 14,
			14, 24, 08);

		if (peh.timestamp.getTime() !== expectedDate.getTime())
			throw peh.timestamp + " expected " + expectedDate;
	}

	export function read_pointerToSymbolTable_252579084() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.pointerToSymbolTable !== 252579084)
			throw peh.pointerToSymbolTable;
	}

	export function read_numberOfSymbols_319951120() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.numberOfSymbols !== 319951120)
			throw peh.numberOfSymbols;
	}

	export function read_sizeOfOptionalHeader_5396() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.sizeOfOptionalHeader !== 5396)
			throw peh.sizeOfOptionalHeader;
	}

	export function read_characteristics_5910() {
		var bi = new pe.io.BufferReader(bytes);
		var peh = new pe.headers.PEHeader();
		peh.read(bi);

		if (peh.characteristics !== 5910)
			throw peh.characteristics;
	}
}