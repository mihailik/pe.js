namespace tests.DllImport_read_012345 {

	var sampleBuf: any = (function () {
		var buf: number[] = [];
		for (var i = 0; i < 400; i++) {
			buf[i] = 0;
		}

		// originalFirstThunk
		buf[0] = 50;
		buf[1] = buf[2] = buf[3] = 0;

		// importPosition rva
		buf[50] = 150;
		buf[51] = buf[52] = buf[53] = 0;

		// ordinal
		buf[150] = 14;
		buf[151] = 0;

		// name
		buf[152] = ("Q").charCodeAt(0);
		buf[153] = 0;

		// library name rva
		buf[12] = 100;
		buf[13] = buf[14] = buf[15] = 0;
		buf[100] = ("Y").charCodeAt(0);
		buf[101] = 0;


		// importPosition ordinal
		buf[54] = 250;
		buf[55] = buf[56] = 0;
		buf[57] = 128;

		return buf;
	})();

	var global = (function () { return this; })();
	var bytes;

	if ("ArrayBuffer" in global) {
		var arrb = new ArrayBuffer(sampleBuf.length);
		var vi = new DataView(arrb);
		for (var i = 0; i < sampleBuf.length; i++) {
			vi.setUint8(i, sampleBuf[i]);
		}

		bytes = arrb;
	}
	else {
		bytes = <any>sampleBuf;
	}


	export function read_succeeds() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);
	}

	export function read_length_2() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports.length !== 2)
			throw imports.length;
	}

	export function read_0_dllName_Y() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].dllName !== "Y")
			throw imports[0].dllName;
	}

	export function read_0_name_Q() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].name !== "Q")
			throw imports[0].name;
	}

	export function read_0_ordinal_14() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[0].ordinal !== 14)
			throw imports[0].ordinal;
	}

	export function read_1_dllName_Y() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[1].dllName !== "Y")
			throw imports[1].dllName;
	}

	export function read_1_name_null() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[1].name !== null)
			throw imports[1].name;
	}

	export function read_1_ordinal_250() {
		var bi = new pe.io.BufferReader(bytes);
		bi.sections.push(new pe.headers.AddressRangeMap(0, sampleBuf.length, 0));
		var imports = pe.unmanaged.DllImport.read(bi);

		if (imports[1].ordinal !== 250)
			throw imports[1].ordinal;
	}
}