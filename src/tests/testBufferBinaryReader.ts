/// <reference path="../pe.ts" />

module test_BufferBinaryReader {

	export function constructor_succeeds() {
		var br = new pe.io.BufferBinaryReader([], 0);
	}

	export function readByte_firstByte_43() {
		var br = new pe.io.BufferBinaryReader([ 43 ], 0);

		var b = br.readByte();

		if (b !== 43)
			throw br;
	}

	export function readByte_twice_98() {
		var br = new pe.io.BufferBinaryReader([ 43, 98 ], 0);

		br.readByte();
		var b = br.readByte();

		if (b !== 98)
			throw br;
	}

	export function constructorWithOffset_4_readByte_101() {
		var br = new pe.io.BufferBinaryReader([ 43, 98, 31, 9, 101 ], 4);

		var b = br.readByte();

		if (b !== 101)
			throw br;
	}

	export function readBytes_1234() {
		var br = new pe.io.BufferBinaryReader([ 1, 2, 3, 4 ]);

		var b = <any>br.readBytes(4);

		var bStr = b.join(",");

		if (bStr !== "1,2,3,4")
			throw bStr + " expected 1,2,3,4";
	}

	export function skipBytes_1234_3() {
		var br = new pe.io.BufferBinaryReader([ 1, 2, 3, 4 ]);

		br.readBytes(2);

		var b = br.readByte();

		if (b !== 3)
			throw b;
	}

	export function clone_1234_1() {
		var br = new pe.io.BufferBinaryReader([ 1, 2, 3, 4 ]);

		var clo = br.clone();

		br.readBytes(2);

		var b = clo.readByte();

		if (b !== 1)
			throw b;
	}

	export function clone_1234_2() {
		var br = new pe.io.BufferBinaryReader([ 1, 2, 3, 4 ]);

		br.skipBytes(1);

		var clo = br.clone();

		br.readBytes(2);

		var b = clo.readByte();

		if (b !== 2)
			throw b;
	}
}