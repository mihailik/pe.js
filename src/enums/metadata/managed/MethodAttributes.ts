module pe.managed.metadata {

  /** [ECMA-335 para23.1.10] */
	export enum MethodAttributes {

		// These 3 bits contain one of the following values:
		// CompilerControlled, 
		// Private, 
		// FamANDAssem, 
		// Assem, 
		// Family, 
		// FamORAssem, 
		// Public
		MemberAccessMask = 0x0007,

		// Member not referenceable.
		CompilerControlled = 0x0000,


		// Accessible only by the parent type.
		Private = 0x0001,

		// Accessible by sub-types only in this Assembly.
		FamANDAssem = 0x0002,

		// Accessibly by anyone in the Assembly.
		Assem = 0x0003,

		// Accessible only by type and sub-types.
		Family = 0x0004,

		// Accessibly by sub-types anywhere, plus anyone in assembly.
		FamORAssem = 0x0005,

		// Accessibly by anyone who has visibility to this scope.
		Public = 0x0006,


		// Defined on type, else per instance.
		Static = 0x0010,

		// Method cannot be overridden.
		Final = 0x0020,

		// Method is virtual.
		Virtual = 0x0040,

		// Method hides by name+sig, else just by name.
		HideBySig = 0x0080,


		// Use this mask to retrieve vtable attributes. This bit contains one of the following values:
		// ReuseSlot, NewSlot.
		VtableLayoutMask = 0x0100,

		// Method reuses existing slot in vtable.
		ReuseSlot = 0x0000,

		// Method always gets a new slot in the vtable.
		NewSlot = 0x0100,


		// Method can only be overriden if also accessible.
		Strict = 0x0200,

		// Method does not provide an implementation.
		Abstract = 0x0400,

		// Method is special.
		SpecialName = 0x0800,


		// Interop attributes

		// Implementation is forwarded through PInvoke.
		PInvokeImpl = 0x2000,

		// Reserved: shall be zero for conforming implementations.
		UnmanagedExport = 0x0008,


		// Additional flags

		// CLI provides 'special' behavior, depending upon the name of the method.
		RTSpecialName = 0x1000,

		// Method has security associated with it.
		HasSecurity = 0x4000,

		// Method calls another method containing security code.
		RequireSecObject = 0x8000
	}

}