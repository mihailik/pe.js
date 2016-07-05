namespace tests.SectionHeader {

	export function constructor_succeeds() {
		var seh = new pe.headers.SectionHeader();
	}

	export function name_defaultEmptyString() {
		var seh = new pe.headers.SectionHeader();
		if (seh.name !== "")
			throw seh.name;
	}

	export function toString_default() {
		var seh = new pe.headers.SectionHeader();
		var expectedString = " 0:0@0h";
		if (seh.toString() != expectedString)
			throw seh + " expected " + expectedString;
	}

	export function pointerToRelocations_default0() {
		var seh = new pe.headers.SectionHeader();
		if (seh.pointerToRelocations !== 0)
			throw seh.pointerToRelocations;
	}
}