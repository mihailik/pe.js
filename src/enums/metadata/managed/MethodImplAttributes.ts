module pe.managed.metadata {

  export enum MethodImplAttributes {

		// These 2 bits contain one of the following values:
		// IL, Native, OPTIL, Runtime.
		CodeTypeMask = 0x0003,

		// Method impl is CIL.
		IL = 0x0000,

		// Method impl is native.
		Native = 0x0001,

		// Reserved: shall be zero in conforming implementations.
		OPTIL = 0x0002,

		// Method impl is provided by the runtime.
		Runtime = 0x0003,


		// Flags specifying whether the code is managed or unmanaged.
		// This bit contains one of the following values:
		// Unmanaged, Managed.
		ManagedMask = 0x0004,

		// Method impl is unmanaged, otherwise managed.
		Unmanaged = 0x0004,

		// Method impl is managed.
		Managed = 0x0000,


		// Implementation info and interop

		// Indicates method is defined; used primarily in merge scenarios.
		ForwardRef = 0x0010,

		// Reserved: conforming implementations can ignore.
		PreserveSig = 0x0080,

		// Reserved: shall be zero in conforming implementations.
		InternalCall = 0x1000,

		// Method is single threaded through the body.
		Synchronized = 0x0020,

		// Method cannot be inlined.
		NoInlining = 0x0008,

		// Range check value.
		MaxMethodImplVal = 0xffff,

		// Method will not be optimized when generating native code.
		NoOptimization = 0x0040,
	}

}