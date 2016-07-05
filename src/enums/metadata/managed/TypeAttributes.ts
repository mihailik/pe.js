module pe.managed.metadata {

export enum TypeAttributes {
		// Visibility attributes

		// Use this mask to retrieve visibility information.
		// These 3 bits contain one of the following values:
		// NotPublic, Public,
		// NestedPublic, NestedPrivate,
		// NestedFamily, NestedAssembly,
		// NestedFamANDAssem, NestedFamORAssem.
		VisibilityMask = 0x00000007,

		// Class has no public scope.
		NotPublic = 0x00000000,

		// Class has public scope.
		Public = 0x00000001,

		// Class is nested with public visibility.
		NestedPublic = 0x00000002,

		// Class is nested with private visibility.
		NestedPrivate = 0x00000003,

		// Class is nested with family visibility.
		NestedFamily = 0x00000004,

		// Class is nested with assembly visibility.
		NestedAssembly = 0x00000005,

		// Class is nested with family and assembly visibility.
		NestedFamANDAssem = 0x00000006,

		// Class is nested with family or assembly visibility.
		NestedFamORAssem = 0x00000007,


		// Class layout attributes

		// Use this mask to retrieve class layout information.
		// These 2 bits contain one of the following values:
		// AutoLayout, SequentialLayout, ExplicitLayout.
		LayoutMask = 0x00000018,

		// Class fields are auto-laid out.
		AutoLayout = 0x00000000,

		// Class fields are laid out sequentially.
		SequentialLayout = 0x00000008,

		// Layout is supplied explicitly.
		ExplicitLayout = 0x00000010,


		// Class semantics attributes

		// Use this mask to retrive class semantics information.
		// This bit contains one of the following values:
		// Class, Interface.
		ClassSemanticsMask = 0x00000020,

		// Type is a class.
		Class = 0x00000000,

		// Type is an interface.
		Interface = 0x00000020,


		// Special semantics in addition to class semantics

		// Class is abstract.
		Abstract = 0x00000080,

		// Class cannot be extended.
		Sealed = 0x00000100,

		// Class name is special.
		SpecialName = 0x00000400,


		// Implementation Attributes

		// Class/Interface is imported.
		Import = 0x00001000,

		// Reserved (Class is serializable)
		Serializable = 0x00002000,


		// String formatting Attributes

		// Use this mask to retrieve string information for native interop.
		// These 2 bits contain one of the following values:
		// AnsiClass, UnicodeClass, AutoClass, CustomFormatClass.
		StringFormatMask = 0x00030000,

		// LPSTR is interpreted as ANSI.
		AnsiClass = 0x00000000,

		// LPSTR is interpreted as Unicode.
		UnicodeClass = 0x00010000,

		// LPSTR is interpreted automatically.
		AutoClass = 0x00020000,

		// A non-standard encoding specified by CustomStringFormatMask.
		CustomFormatClass = 0x00030000,

		// Use this mask to retrieve non-standard encoding information for native interop.
		// The meaning of the values of these 2 bits isunspecified.
		CustomStringFormatMask = 0x00C00000,


		// Class Initialization Attributes

		// Initialize the class before first static field access.
		BeforeFieldInit = 0x00100000,


		// Additional Flags

		// CLI provides 'special' behavior, depending upon the name of the Type
		RTSpecialName = 0x00000800,

		// Type has security associate with it.
		HasSecurity = 0x00040000,

		// This ExportedTypeEntry is a type forwarder.
		IsTypeForwarder = 0x00200000
	}

}