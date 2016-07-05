namespace tests.ClrDirectory_old {

	export function constructor_succeeds() {
		var cdi = new pe.managed.metadata.ClrDirectory();
	}

	export function cb_default_0() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.cb !== 0)
			throw cdi.cb;
	}

	export function runtimeVersion_default_emptyString() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.runtimeVersion !== "")
			throw cdi.runtimeVersion;
	}

	export function imageFlags_default_0() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.imageFlags !== 0)
			throw cdi.imageFlags;
	}

	export function metadataDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.metadataDir !== null)
			throw cdi.metadataDir;
	}

	export function entryPointToken_default_0() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.entryPointToken !== 0)
			throw cdi.entryPointToken;
	}

	export function resourcesDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.resourcesDir !== null)
			throw cdi.resourcesDir;
	}

	export function strongNameSignatureDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.strongNameSignatureDir !== null)
			throw cdi.strongNameSignatureDir;
	}

	export function codeManagerTableDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.codeManagerTableDir !== null)
			throw cdi.codeManagerTableDir;
	}

	export function vtableFixupsDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.vtableFixupsDir !== null)
			throw cdi.vtableFixupsDir;
	}

	export function exportAddressTableJumpsDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.exportAddressTableJumpsDir !== null)
			throw cdi.exportAddressTableJumpsDir;
	}

	export function managedNativeHeaderDir_default_null() {
		var cdi = new pe.managed.metadata.ClrDirectory();
		if (cdi.managedNativeHeaderDir !== null)
			throw cdi.managedNativeHeaderDir;
	}
}