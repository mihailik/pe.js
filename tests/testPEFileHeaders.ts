namespace tests.PEFileHeaders {

	export function constructor_succeeds() {
		var pefi = new pe.headers.PEFileHeaders();
	}

	export function dosHeader_defaultNotNull() {
		var pefi = new pe.headers.PEFileHeaders();
		if (!pefi.dosHeader)
			throw pefi.dosHeader;
	}

	export function peHeader_defaultNotNull() {
		var pefi = new pe.headers.PEFileHeaders();
		if (!pefi.peHeader)
			throw pefi.peHeader;
	}

	export function optionalHeader_defaultNotNull() {
		var pefi = new pe.headers.PEFileHeaders();
		if (!pefi.optionalHeader)
			throw pefi.optionalHeader;
	}

	export function sectionHeaders_defaultZeroLength() {
		var pefi = new pe.headers.PEFileHeaders();
		if (pefi.sectionHeaders.length!==0)
			throw pefi.sectionHeaders.length;
	}

	export function toString_default() {
		var pefi = new pe.headers.PEFileHeaders();
		var expectedToString_withNullDosHeader = "dosHeader: [MZ].lfanew=0h dosStub: null peHeader: [332] optionalHeader: [WindowsCUI,] sectionHeaders: [0]";
    var expectedToString = 'dosHeader: [MZ].lfanew=0h dosStub: [0] peHeader: [332] optionalHeader: [WindowsCUI,] sectionHeaders: [0]';

		if (pefi.toString()!==expectedToString)
			throw pefi.toString() + " instead of expected " + expectedToString;
	}
}