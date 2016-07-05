namespace tests.BufferReader {

	export function constructor_succeeds() {
		var br = new pe.io.BufferReader([]);
	}

	export function readByte_firstByte_43() {
		var br = new pe.io.BufferReader([ 43 ]);

		var b = br.readByte();

		if (b !== 43)
			throw br;
	}

	export function readByte_twice_98() {
		var br = new pe.io.BufferReader([ 43, 98 ]);

		br.readByte();
		var b = br.readByte();

		if (b !== 98)
			throw br;
	}

	export function readBytes_1234() {
		var br = new pe.io.BufferReader([ 1, 2, 3, 4 ]);

		var b = <any>br.readBytes(4);

		var bStr = b.join(",");

		if (bStr !== "1,2,3,4")
			throw bStr + " expected 1,2,3,4";
	}

	export function skipBytes_1234_3() {
		var br = new pe.io.BufferReader([ 1, 2, 3, 4 ]);

		br.readBytes(2);

		var b = br.readByte();

		if (b !== 3)
			throw b;
	}

}