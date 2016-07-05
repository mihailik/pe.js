namespace tests.AddressRange {

	export function constructor_succeeds() {
		var dd = new pe.headers.AddressRange(0, 0);
	}

	export function constructor_assigns_address_654201() {
		var dd = new pe.headers.AddressRange(654201, 0);
		if (dd.address !== 654201)
			throw dd.address;
	}

	export function constructor_assigns_size_900114() {
		var dd = new pe.headers.AddressRange(0, 900114);
		if (dd.size !== 900114)
			throw dd.size;
	}

	export function toString_0xCEF_0x36A() {
		var dd = new pe.headers.AddressRange(0xCEF, 0x36A);
		if (dd.toString() !== "CEF:36Ah")
			throw dd.toString();
	}

	export function mapRelative_default_0_minus1() {
		var dd = new pe.headers.AddressRange(0, 0);
		var r = dd.mapRelative(0);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_default_64_minus1() {
		var dd = new pe.headers.AddressRange(0, 0);
		var r = dd.mapRelative(64);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_default_minus64_minus1() {
		var dd = new pe.headers.AddressRange(0, 0);
		var r = dd.mapRelative(-64);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_lowerEnd_below_minus1() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(9);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_lowerEnd_equal_0() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(10);
		if (r !== 0)
			throw r;
	}

	export function mapRelative_lowerEnd_above_1() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(11);
		if (r !== 1)
			throw r;
	}

	export function mapRelative_lowerEndPlusSize_above_minus1() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(31);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_lowerEndPlusSize_equal_minus1() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(30);
		if (r !== -1)
			throw r;
	}

	export function mapRelative_lowerEndPlusSize_below_sizeMinus1() {
		var dd = new pe.headers.AddressRange(10, 20);
		var r = dd.mapRelative(29);
		if (r !== 19)
			throw r;
	}
}