namespace tests.ResourceDirectory {

	export function constructor_succeeds() {
		var dr = new pe.unmanaged.ResourceDirectory();
	}

	export function characterstics_default_0() {
		var dr = new pe.unmanaged.ResourceDirectory();

		if (dr.characteristics !== 0)
			throw dr.characteristics;
	}

	export function timestamp_default_Epoch() {
		var dr = new pe.unmanaged.ResourceDirectory();

		if (dr.timestamp.getTime() !== new Date(0).getTime())
			throw dr.timestamp + " expected " + new Date(0);
	}

	export function version_default_emptyString() {
		var dr = new pe.unmanaged.ResourceDirectory();

		if (dr.version !== "")
			throw dr.version;
	}

	export function subdirectories_default_length_0() {
		var dr = new pe.unmanaged.ResourceDirectory();

		if (dr.subdirectories.length !== 0)
			throw dr.subdirectories.length;
	}

	export function dataEntries_default_length_0() {
		var dr = new pe.unmanaged.ResourceDirectory();

		if (dr.dataEntries.length !== 0)
			throw dr.dataEntries.length;
	}
}