module pe.managed.metadata {

// [ECMA-335 para23.1.14]
	export enum PropertyAttributes {

		// Property is special.
		SpecialName = 0x0200,

		// Runtime(metadata internal APIs) should check name encoding.
		RTSpecialName = 0x0400,

		// Property has default.
		HasDefault = 0x1000,

		// Reserved: shall be zero in a conforming implementation.
		Unused = 0xe9ff
	}

}