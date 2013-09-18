/// <reference path="../pe.ts" />
/// <reference path="sampleExe.ts" />

module test_AssemblyReader_sampleExe_old {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var asm = new pe.managed.AssemblyDefinition();
		asm.read(bi);
	}
}