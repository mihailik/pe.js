namespace tests.PEHeader {

	export function constructor_succeeds() {
		var peh = new pe.headers.PEHeader();
	}

	export function pe_defaultPE() {
		var peh = new pe.headers.PEHeader();
		if (peh.pe !== pe.headers.PESignature.PE)
			throw peh.pe;
	}

	export function machine_defaultI386() {
		var peh = new pe.headers.PEHeader();
		if (peh.machine !== pe.headers.Machine.I386)
			throw peh.machine;
	}

	export function numberOfSections_default0() {
		var peh = new pe.headers.PEHeader();
		if (peh.numberOfSections !== 0)
			throw peh.numberOfSections;
	}

	export function timestamp_defaultZeroDate() {
		var peh = new pe.headers.PEHeader();
		if (peh.timestamp.getTime() !== new Date(0).getTime())
			throw peh.timestamp;
	}

	export function pointerToSymbolTable_default0() {
		var peh = new pe.headers.PEHeader();
		if (peh.pointerToSymbolTable !== 0)
			throw peh.pointerToSymbolTable;
	}

	export function numberOfSymbols_default0() {
		var peh = new pe.headers.PEHeader();
		if (peh.numberOfSymbols !== 0)
			throw peh.numberOfSymbols;
	}

	export function sizeOfOptionalHeader_default0() {
		var peh = new pe.headers.PEHeader();
		if (peh.sizeOfOptionalHeader !== 0)
			throw peh.sizeOfOptionalHeader;
	}

	export function characteristics_defaultDll() {
		var peh = new pe.headers.PEHeader();
		var expected = pe.headers.ImageCharacteristics.Dll | pe.headers.ImageCharacteristics.Bit32Machine;
		if (peh.characteristics !== expected)
			throw peh.characteristics + " expected " + expected;
	}

	export function toString_default() {
		var peh = new pe.headers.PEHeader();
    var expected = "I386 Bit32Machine | Dll Sections[0]";
		if (peh.toString() !== expected)
			throw peh.toString() + ' expected ' + expected;
	}
}