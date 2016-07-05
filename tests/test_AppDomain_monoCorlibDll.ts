declare var monoCorlib: ArrayBuffer;

namespace tests.AppDomain_monoCorlibDll {

	export function constructor_succeeds() {
		var appDomain = new pe.managed.AppDomain();
	}

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);
	}

	export function read_toString() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		var expectedFullName = "mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089";

		if (asm.toString() !== expectedFullName)
			throw asm.toString() + " expected " + expectedFullName;
	}

	export function read_types_length_2094() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);

		if (asm.types.length !== 2094)
			throw asm.types.length;
	}

	export function read_types_0_1_21_last_toString() {
		var bi = new pe.io.BufferReader(monoCorlib);
		var appDomain = new pe.managed.AppDomain();
		var asm = appDomain.read(bi);


    var expectedFullName_0 = "<Module>";
		var expectedFullName_1 = "Consts";
		var expectedFullName_21 = "Microsoft.Win32.SafeHandles.SafeFileHandle";
		var expectedFullName_last = "<SpawnBestNumber>c__AnonStorey45";

		var t0 = asm.types[0];
		var t1 = asm.types[1];
    var t21 = asm.types[21];
    var tlast = asm.types[asm.types.length-1];


    var expectedList = expectedFullName_0+' '+expectedFullName_1+' '+expectedFullName_21+' '+expectedFullName_last;
    var actualList = t0.toString()+' '+t1.toString()+' '+t21.toString()+' '+tlast.toString();

		if (actualList!==expectedList)
			throw actualList + " expected " + expectedList;
	}


}