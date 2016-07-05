namespace tests.AppDomain_sampleExe {

	export function constructor_succeeds() {
		var appDomain = new pe.managed.AppDomain();
	}

	export function constructor_hasMscorlib() {
		var appDomain = new pe.managed.AppDomain();
		if (appDomain.assemblies.length !== 1)
			throw "incorrect number of assemblies: " + appDomain.assemblies.length;
		var mscorlib = appDomain.assemblies[0];
		if (mscorlib.name!=="mscorlib")
			throw "incorrect name of mscorlib: " + mscorlib.name;
		if (!mscorlib.isSpeculative)
			throw "mscorlib should be marked as speculative on init";
	}

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);
	}

	export function read_has1Assembly() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);
		if (appDomain.assemblies.length!==1)
			throw "incorrect number of assemblies: " + appDomain.assemblies.length;
	}

	export function read_toString() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var expectedFullName = "sample, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null";

		if (asm.toString() !== expectedFullName)
			throw asm.toString() + " expected " + expectedFullName;
	}

	export function read_types_length2() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		if (asm.types.length!==2)
			throw asm.types.length;
	}

	export function read_types_0_toString() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[0];

		var expectedFullName = "<Module>";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}

	export function read_types_1_toString() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var t0 = asm.types[1];

		var expectedFullName = "Program";

		if (t0.toString()!==expectedFullName)
			throw t0.toString() + " expected " + expectedFullName;
	}
}