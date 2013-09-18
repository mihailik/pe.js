/// <reference path="../pe.ts" />

declare var monoCorlib: ArrayBuffer;

module test_AppDomain_monoCorlibDll {

	export function constructor_succeeds() {
		var appDomain = new pe.managed2.AppDomain();
	}

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);
	}

	export function read_toString() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);

		var expectedFullName = "mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089";

		if (asm.toString() !== expectedFullName)
			throw asm.toString() + " expected " + expectedFullName;
	}

	export function read_types_length_2094() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);

		if (asm.types.length !== 2094)
			throw asm.types.length;
	}

	export function read_types_0_toString() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[0];

		var expectedFullName = "System.Void";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}

	export function read_types_21_toString() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[21];

		var expectedFullName = "<Module>";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}
}