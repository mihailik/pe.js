namespace tests.Long {

	export function constructor_succeeds() {
		var lg = new pe.Long(0, 0);
	}

	export function constructor_assigns_lo_602048() {
		var lg = new pe.Long(602048, 0);
		if (lg.lo !== 602048)
			throw lg.lo;
	}

	export function constructor_assigns_hi_2130006() {
		var lg = new pe.Long(0, 2130006);
		if (lg.hi !== 2130006)
			throw lg.hi;
	}

	export function toString_zeros() {
		var lg = new pe.Long(0, 0);
		if (lg.toString() !== "0h")
			throw lg.toString();
	}

	export function toString_1() {
		var lg = new pe.Long(1, 0);
		if (lg.toString() !== "1h")
			throw lg.toString();
	}

	export function toString_0xB() {
		var lg = new pe.Long(0xB, 0);
		if (lg.toString() !== "Bh")
			throw lg.toString();
	}

	export function toString_0xFFFF() {
		var lg = new pe.Long(0xFFFF, 0);
		if (lg.toString() !== "FFFFh")
			throw lg.toString();
	}

	export function toString_0xFFFF0() {
		var lg = new pe.Long(0xFFF0, 0xF);
		if (lg.toString() !== "FFFF0h")
			throw lg.toString();
	}

	export function toString_0xFFFFFFFF() {
		var lg = new pe.Long(0xFFFF, 0xFFFF);
		if (lg.toString() !== "FFFFFFFFh")
			throw lg.toString();
	}
}