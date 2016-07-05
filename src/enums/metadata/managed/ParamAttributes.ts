module pe.managed.metadata {

// [ECMA-335 para23.1.13]
	export enum ParamAttributes {

		// Param is [In].
		In = 0x0001,

		// Param is [out].
		Out = 0x0002,

		// Param is optional.
		Optional = 0x0010,

		// Param has default value.
		HasDefault = 0x1000,

		// Param has FieldMarshal.
		HasFieldMarshal = 0x2000,

		// Reserved: shall be zero in a conforming implementation.
		Unused = 0xcfe0,
	}

}