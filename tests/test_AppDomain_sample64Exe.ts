namespace tests.AppDomain_sample64Exe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);
	}

	export function read_toString() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var expectedFullName = "sample64, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null";

		if (asm.toString() !== expectedFullName)
			throw asm.toString() + " expected " + expectedFullName;
	}

	export function read_types_length2() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		if (asm.types.length!==2)
			throw asm.types.length;
	}

	export function read_types_0_toString() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[0];

		var expectedFullName = "<Module>";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}

	export function read_types_1_toString() {
		var bi = new pe.io.BufferReader(sample64Exe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[1];

		var expectedFullName = "Program";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}
}