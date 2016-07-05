module pe.managed.metadata {

  // [ECMA-335 para23.1.8]
	export enum PInvokeAttributes {

		// PInvoke is to use the member name as specified.
		NoMangle = 0x0001,


		// Character set

		// These 2 bits contain one of the following values:
		// CharSetNotSpec,
		// CharSetAnsi,
		// CharSetUnicode,
		// CharSetAuto.
		CharSetMask = 0x0006,

		CharSetNotSpec = 0x0000,
		CharSetAnsi = 0x0002,
		CharSetUnicode = 0x0004,
		CharSetAuto = 0x0006,


		// Information about target function. Not relevant for fields.
		SupportsLastError = 0x0040,


		// Calling convention

		// These 3 bits contain one of the following values:
		// CallConvPlatformapi,
		// CallConvCdecl,
		// CallConvStdcall,
		// CallConvThiscall,
		// CallConvFastcall.
		CallConvMask = 0x0700,
		CallConvPlatformapi = 0x0100,
		CallConvCdecl = 0x0200,
		CallConvStdcall = 0x0300,
		CallConvThiscall = 0x0400,
		CallConvFastcall = 0x0500
	}

}