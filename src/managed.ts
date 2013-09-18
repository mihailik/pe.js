/// <reference path="io.ts" />
/// <reference path="headers.ts" />

module pe.managed {
	export enum ClrImageFlags {
		ILOnly = 0x00000001,
		_32BitRequired = 0x00000002,
		ILLibrary = 0x00000004,
		StrongNameSigned = 0x00000008,
		NativeEntryPoint = 0x00000010,
		TrackDebugData = 0x00010000,
		IsIbcoptimized = 0x00020000,	// NEW
	}

	export enum ClrMetadataSignature {
		Signature = 0x424a5342
	}

	export enum AssemblyHashAlgorithm {
		None = 0x0000,
		Reserved = 0x8003,
		Sha1 = 0x8004
	}

	export enum AssemblyFlags {
		// The assembly reference holds the full (unhashed) public key.
		PublicKey = 0x0001,

		// The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
		// (See the text following this table.)
		Retargetable = 0x0100,

		// Reserved 
		// (a conforming implementation of the CLI can ignore this setting on read;
		// some implementations might use this bit to indicate
		// that a CIL-to-native-code compiler should not generate optimized code).
		DisableJITcompileOptimizer = 0x4000,

		// Reserved
		// (a conforming implementation of the CLI can ignore this setting on read;
		// some implementations might use this bit to indicate
		// that a CIL-to-native-code compiler should generate CIL-to-native code map).
		EnableJITcompileTracking = 0x8000
	}

	// [ECMA-335 para23.1.16]
	export enum ElementType {

		// Marks end of a list.
		End = 0x00,

		Void = 0x01,

		Boolean = 0x02,

		Char = 0x03,

		I1 = 0x04,
		U1 = 0x05,
		I2 = 0x06,
		U2 = 0x07,
		I4 = 0x08,
		U4 = 0x09,
		I8 = 0x0a,
		U8 = 0x0b,
		R4 = 0x0c,
		R8 = 0x0d,
		String = 0x0e,

		// Followed by type.
		Ptr = 0x0f,

		// Followed by type.
		ByRef = 0x10,

		// Followed by TypeDef or TypeRef token.
		ValueType = 0x11,

		// Followed by TypeDef or TypeRef token.
		Class = 0x12,

		// Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
		Var = 0x13,

		// type rank boundsCount bound1 � loCount lo1 �
		Array = 0x14,

		// Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
		GenericInst = 0x15,

		TypedByRef = 0x16,

		// System.IntPtr
		I = 0x18,

		// System.UIntPtr
		U = 0x19,

		// Followed by full method signature.
		FnPtr = 0x1b,

		// System.Object
		Object = 0x1c,

		// Single-dim array with 0 lower bound
		SZArray = 0x1d,

		// Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
		MVar = 0x1e,

		// Required modifier: followed by TypeDef or TypeRef token.
		CMod_ReqD = 0x1f,

		// Optional modifier: followed by TypeDef or TypeRef token.
		CMod_Opt = 0x20,

		// Implemented within the CLI.
		Internal = 0x21,

		// Or'd with following element types.
		Modifier = 0x40,

		// Sentinel for vararg method signature.
		Sentinel = 0x01 | Modifier,

		// Denotes a local variable that points at a pinned object,
		Pinned = 0x05 | Modifier,

		R4_Hfa = 0x06 | Modifier,
		R8_Hfa = 0x07 | Modifier,

		// Indicates an argument of type System.Type.
		ArgumentType_ = 0x10 | Modifier,

		// Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
		CustomAttribute_BoxedObject_ = 0x11 | Modifier,

		// Reserved_ = 0x12 | Modifier,

		// Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
		CustomAttribute_Field_ = 0x13 | Modifier,

		// Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
		CustomAttribute_Property_ = 0x14 | Modifier,

		// Used in custom attributes to specify an enum (ECMA-335 para23.3).
		CustomAttribute_Enum_ = 0x55
	}

	// Look in ECMA-335 para22.11.
	export enum SecurityAction {

		// Without further checks, satisfy Demand for the specified permission.
		// Valid scope: Method, Type;
		Assert = 3,

		// Check that all callers in the call chain have been granted specified permission,
		// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
		// Valid scope: Method, Type.
		Demand = 2,

		// Without further checks refuse Demand for the specified permission.
		// Valid scope: Method, Type.
		Deny = 4,

		// The specified permission shall be granted in order to inherit from class or override virtual method.
		// Valid scope: Method, Type 

		InheritanceDemand = 7,

		// Check that the immediate caller has been granted the specified permission;
		// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
		// Valid scope: Method, Type.
		LinkDemand = 6,

		//  Check that the current assembly has been granted the specified permission;
		//  throw SecurityException (see Partition IV) otherwise.
		//  Valid scope: Method, Type.
		NonCasDemand = 0, // TODO: find the correct value

		// Check that the immediate caller has been granted the specified permission;
		// throw SecurityException (see Partition IV) otherwise.
		// Valid scope: Method, Type.
		NonCasLinkDemand = 0,  // TODO: find the correct value

		// Reserved for implementation-specific use.
		// Valid scope: Assembly.
		PrejitGrant = 0,  // TODO: find the correct value
 
		// Without further checks, refuse Demand for all permissions other than those specified.
		// Valid scope: Method, Type 
		PermitOnly = 5,

		// Specify the minimum permissions required to runmanaged.
		// Valid scope: Assembly.
		RequestMinimum = 8,

		// Specify the optional permissions to grant.
		// Valid scope: Assembly.
		RequestOptional = 9,

		// Specify the permissions not to be granted.
		// Valid scope: Assembly.
		RequestRefuse = 10
	}

	// [ECMA-335 para23.1.4]
	export enum EventAttributes {

		// Event is special.
		SpecialName = 0x0200,

		// CLI provides 'special' behavior, depending upon the name of the event.
		RTSpecialName = 0x0400,
	}

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

	// [ECMA-335 para23.1.5]
	export enum FieldAttributes {

		// These 3 bits contain one of the following values:
		// CompilerControlled, Private,
		// FamANDAssem, Assembly,
		// Family, FamORAssem,
		// Public.
		FieldAccessMask = 0x0007,

		// Member not referenceable.
		CompilerControlled = 0x0000,

		// Accessible only by the parent type.
		Private = 0x0001,

		// Accessible by sub-types only in this Assembly.
		FamANDAssem = 0x0002,

		// Accessibly by anyone in the Assembly.
		Assembly = 0x0003,

		// Accessible only by type and sub-types.
		Family = 0x0004,

		// Accessibly by sub-types anywhere, plus anyone in assembly.
		FamORAssem = 0x0005,

		// Accessibly by anyone who has visibility to this scope field contract attributes.
		Public = 0x0006,


		// Defined on type, else per instance.
		Static = 0x0010,

		// Field can only be initialized, not written to after init.
		InitOnly = 0x0020,

		// Value is compile time constant.
		Literal = 0x0040,

		// Reserved (to indicate this field should not be serialized when type is remoted).
		NotSerialized = 0x0080,

		// Field is special.
		SpecialName = 0x0200,


		// Interop Attributes

		// Implementation is forwarded through PInvoke.
		PInvokeImpl = 0x2000,


		// Additional flags

		// CLI provides 'special' behavior, depending upon the name of the field.
		RTSpecialName = 0x0400,

		// Field has marshalling information.
		HasFieldMarshal = 0x1000,

		// Field has default.
		HasDefault = 0x8000,

		// Field has RVA.
		HasFieldRVA = 0x0100
	}

	// [ECMA-335 para23.1.6]
	export enum FileAttributes {

		// This is not a resource file.
		ContainsMetaData = 0x0000,

		// This is a resource file or other non-metadata-containing file.
		ContainsNoMetaData = 0x0001
	}

	// [ECMA-335 para23.1.7]
	export enum GenericParamAttributes {

		// These 2 bits contain one of the following values:
		// VarianceMask,
		// None,
		// Covariant,
		// Contravariant.
		VarianceMask = 0x0003,

		// The generic parameter is non-variant and has no special constraints.
		None = 0x0000,

		// The generic parameter is covariant.
		Covariant = 0x0001,

		// The generic parameter is contravariant.
		Contravariant = 0x0002,


		// These 3 bits contain one of the following values:
		// ReferenceTypeConstraint,
		// NotNullableValueTypeConstraint,
		// DefaultConstructorConstraint.
		SpecialConstraintMask = 0x001C,

		// The generic parameter has the class special constraint.
		ReferenceTypeConstraint = 0x0004,

		// The generic parameter has the valuetype special constraint.
		NotNullableValueTypeConstraint = 0x0008,

		// The generic parameter has the .ctor special constraint.
		DefaultConstructorConstraint = 0x0010
	}

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

	// [ECMA-335 para23.1.9]
	export enum ManifestResourceAttributes {

		// These 3 bits contain one of the following values:
		VisibilityMask = 0x0007,

		// The Resource is exported from the Assembly.
		Public = 0x0001,

		// The Resource is private to the Assembly.
		Private = 0x0002
	}

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

	// [ECMA-335 para23.1.10]
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

	// [ECMA-335 para23.1.12]
	export enum MethodSemanticsAttributes {

		// Setter for property.
		Setter = 0x0001,

		// Getter for property.
		Getter = 0x0002,

		// Other method for property or event.
		Other = 0x0004,

		// AddOn method for event.
		// This refers to the required add_ method for events.  (ECMA-335 para22.13)
		AddOn = 0x0008,

		// RemoveOn method for event.
		// This refers to the required remove_ method for events. (ECMA-335 para22.13)
		RemoveOn = 0x0010,

		// Fire method for event.
		// This refers to the optional raise_ method for events. (ECMA-335 para22.13)
		Fire = 0x0020
	}

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

	// [ECMA-335 para23.2.3]
	export enum CallingConventions {
		// Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
		Default = 0x0,

		C = 0x1,

		StdCall = 0x2,

		FastCall = 0x4,

		// Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
		VarArg = 0x5,

		// Used to indicate that the method has one or more generic parameters.
		Generic = 0x10,

		// Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
		HasThis = 0x20,

		// Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
		ExplicitThis = 0x40,

		// (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
		Sentinel = 0x41,
	}

	export enum TableKind {
		// The rows in the Module table result from .module directives in the Assembly.
		ModuleDefinition = 0x00,

		// Contains ResolutionScope, TypeName and TypeNamespace columns.
		ExternalType = 0x01,

		// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables 
		// defined at module scope.
		// If a type is generic, its parameters are defined in the GenericParam table (para22.20). Entries in the 
		// GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the 
		// GenericParam table.
		TypeDefinition = 0x02,

		// Each row in the Field table results from a top-level .field directive, or a .field directive inside a 
		// Type. 
		FieldDefinition = 0x04,

		// Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
		// The rows in the MethodDef table result from .method directives (para15). The RVA column is computed when 
		// the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
		MethodDefinition = 0x06,

		// Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
		// The rows in the Param table result from the parameters in a method declaration (para15.4), or from a .param
		// attribute attached to a method.
		ParameterDefinition = 0x08,

		// Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
		// An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field 
		// which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
		// signature, even when it is defined in the same module as the call site.) 
		MemberRef = 0x0A,

		// Used to store compile-time, constant values for fields, parameters, and properties.
		Constant = 0x0B,

		// Stores data that can be used to instantiate a Custom Attribute (more precisely, an 
		// object of the specified Custom Attribute class) at runtime.
		// A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of 
		// the Type column and optionally that of the Value column.
		CustomAttribute = 0x0C,

		// The FieldMarshal table  'links' an existing row in the Field or Param table, to information 
		// in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as 
		// parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
		// A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
		FieldMarshal = 0x0D,

		// The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive 
		// that specifies the Action and PermissionSet on a parent assembly or parent type or method.
		DeclSecurity = 0x0E,

		// Used to define how the fields of a class or value type shall be laid out by the CLI.
		// (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
		ClassLayout = 0x0F,

		// Records the interfaces a type implements explicitly.  Conceptually, each row in the 
		// InterfaceImpl table indicates that Class implements Interface.
		InterfaceImpl = 0x09,

		// A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
		FieldLayout = 0x10,

		// Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table -
		// Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a 
		// metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this 
		// need.  It has just one column, which points to a Signature in the Blob heap.
		StandAloneSig = 0x11,

		// The EventMap and Event tables result from putting the .event directive on a class.
		EventMap = 0x12,

		// The EventMap and Event tables result from putting the .event directive on a class.
		Event = 0x14,

		// The PropertyMap and Property tables result from putting the .property directive on a class.
		PropertyMap = 0x15,

		// Does a little more than group together existing rows from other tables.
		PropertyDefinition = 0x17,

		// The rows of the MethodSemantics table are filled by .property and .event directives.
		MethodSemantics = 0x18,

		// s let a compiler override the default inheritance rules provided by the CLI. Their original use 
		// was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for 
		// both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other 
		// reasons too, limited only by the compiler writer�s ingenuity within the constraints defined in the Validation rules.
		// ILAsm uses the .override directive to specify the rows of the MethodImpl table.
		MethodImpl = 0x19,

		// The rows in the ModuleRef table result from .module extern directives in the Assembly.
		ModuleRef = 0x1A,

		//  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.  
		//  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required, 
		//  typically, for array operations, such as creating, or calling methods on the array class.
		//  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token; 
		//  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, 
		//  box, and unbox.
		TypeSpec = 0x1B,

		// Holds information about unmanaged methods that can be reached from managed code, 
		// using PInvoke dispatch. 
		// A row is entered in the ImplMap table for each parent Method (para15.5) that is defined with a .pinvokeimpl
		// interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
		ImplMap = 0x1C,

		// Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records 
		// the RVA (Relative Virtual Address) within the image file at which this field�s initial value is stored.
		// A row in the FieldRVA table is created for each static parent field that has specified the optional data
		// label.  The RVA column is the relative virtual address of the data in the PE file.
		FieldRVA = 0x1D,

		// ECMA-335 para22.2.
		AssemblyDefinition = 0x20,

		// ECMA-335 para22.4 Shall be ignored by the CLI.
		AssemblyProcessor = 0x21,

		// ECMA-335 para22.3 Shall be ignored by the CLI.
		AssemblyOS = 0x22,

		// The table is defined by the .assembly extern directive (para6.3).  Its columns are filled using directives 
		// similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the 
		// .publickeytoken directive.
		AssemblyRef = 0x23,

		// ECMA-335 para22.7 Shall be ignored by the CLI.
		AssemblyRefProcessor = 0x24,

		// ECMA-335 para22.6 Shall be ignored by the CLI.
		AssemblyRefOS = 0x25,

		// The rows of the File table result from .file directives in an Assembly.
		File = 0x26,

		// Holds a row for each type:
		// a. Defined within other modules of this Assembly; that is exported out of this Assembly.  In essence, it 
		// stores TypeDef row numbers of all types that are marked public in other modules that this Assembly 
		// comprises.  
		// The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row 
		// number) and Implementation (in effect, the module that holds the target TypeDef table).  Note that this 
		// is the only occurrence in metadata of foreign tokens; that is, token values that have a meaning in 
		// another module.  (A regular token value is an index into a table in the current module); OR
		// b. Originally defined in this Assembly but now moved to another Assembly. Flags must have 
		// IsTypeForwarder set and Implementation is an AssemblyRef indicating the Assembly the type may 
		// now be found in.
		ExportedType = 0x27,

		//  The rows in the table result from .mresource directives on the Assembly.
		ManifestResource = 0x28,

		// NestedClass is defined as lexically 'inside' the text of its enclosing Type.
		NestedClass = 0x29,

		// Stores the generic parameters used in generic type definitions and generic method 
		// definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class 
		// and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the 
		// GenericParamConstraint table.)
		// Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or 
		// MethodDef tables.
		GenericParam = 0x2A,

		// Records the signature of an instantiated generic method.
		// Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be 
		// represented by a single row in the table.
		MethodSpec = 0x2B,

		// Records the constraints for each generic parameter.  Each generic parameter
		// can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement 
		// zero or more interfaces.
		// Conceptually, each row in the GenericParamConstraint table is ?owned� by a row in the GenericParam table.
		GenericParamConstraint = 0x2C,
	}
	
	export class AssemblyDefinition {
		headers: headers.PEFileHeaders = null;

		// HashAlgId shall be one of the specified values. [ERROR]
		hashAlgId: AssemblyHashAlgorithm = AssemblyHashAlgorithm.None;

		// MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string = "";

		// Flags shall have only those values set that are specified. [ERROR]
		flags: AssemblyFlags = 0;

		// publicKey can be null or non-null.
		// (note that the Flags.PublicKey bit specifies whether the 'blob' is a full public key, or the short hashed token).
		publicKey: string = "";

		// Name shall index a non-empty string in the String heap. [ERROR]
		// . The string indexed by Name can be of unlimited length.
		name: string = "";

		// Culture  can be null or non-null.
		// If Culture is non-null, it shall index a single string from the list specified (ECMA-335 para23.1.3). [ERROR]
		culture: string = "";

		modules: ModuleDefinition[] = [];

		read(reader: io.BufferReader) {
			var asmReader = new AssemblyReader();
			asmReader.read(reader, this);
		}

		toString() {
			return this.name+", version="+this.version + (this.publicKey ? ", publicKey=" + this.publicKey : "");
		}

		internalReadRow(reader: TableStreamReader): void {
			this.hashAlgId = reader.readInt();
			this.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.flags = reader.readInt();
			this.publicKey = reader.readBlobHex();
			this.name = reader.readString();
			this.culture = reader.readString();
		}
	}

	export class ModuleDefinition {
		runtimeVersion: string = "";
		specificRuntimeVersion: string = "";

		imageFlags: ClrImageFlags = 0;

		metadataVersion: string = "";

		tableStreamVersion: string = "";


		// Ushort
		generation: number = 0;

		name: string = "";

		// The mvid column shall index a unique GUID in the GUID heap (ECMA-335 para24.2.5)
		// that identifies this instance of the module.
		// The mvid can be ignored on read by conforming implementations of the CLI.
		// The mvid should be newly generated for every module,
		// using the algorithm specified in ISO/IEC 11578:1996
		// (Annex A) or another compatible algorithm.

		// [Rationale: While the VES itself makes no use of the Mvid,
		// other tools (such as debuggers, which are outside the scope of this standard)
		// rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
		// end rationale]
		mvid: string = "";

		encId: string = "";
		encBaseId: string = "";

		types: TypeDefinition[] = [];
		debugExternalTypeReferences: ExternalType[] = [];

		toString() {
			return this.name + " " + this.imageFlags;
		}

		internalReadRow(reader: TableStreamReader): void {
			this.generation = reader.readShort();
			this.name = reader.readString();
			this.mvid = reader.readGuid();
			this.encId = reader.readGuid();
			this.encBaseId = reader.readGuid();
		}
	}

	export class TypeReference {
		getName(): string { throw new Error("Not implemented."); }
		getNamespace(): string { throw new Error("Not implemented."); }

		toString() {
			var ns = this.getNamespace();
			var nm = this.getName();
			if (ns && ns.length)
				return ns + "." + nm;
			else
				return nm;
		}
	}

	// TODO: resolve to the actual type on creation
	export class MVar extends TypeReference {
		constructor(public index: number) {
			super();
		}

		getName(): string { return "M" + this.index; }
		getNamespace(): string { return null; }
	}

	// TODO: resolve to the actual type on creation
	export class Var extends TypeReference {
		constructor(public index: number) {
			super();
		}

		getName(): string { return "T" + this.index; }
		getNamespace(): string { return null; }
	}

	export class TypeDefinition extends TypeReference {
		// A 4-byte bitmask of type TypeAttributes, ECMA-335 para23.1.15.
		attributes: number = 0;

		name: string = "";
		namespace: string = "";

		fields: FieldDefinition[] = [];
		methods: MethodDefinition[] = [];

		baseType: any = null;

		internalFieldList: number;
		internalMethodList: number;

		constructor() {
			super();
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readInt();
			this.name = reader.readString();
			this.namespace = reader.readString();
			this.baseType = reader.readTypeDefOrRef();

			this.internalFieldList = reader.readTableRowIndex(TableKind.FieldDefinition);
			this.internalMethodList = reader.readTableRowIndex(TableKind.MethodDefinition);
		}
	}

	export class FieldDefinition {
		attributes: number = 0;
		name: string = "";
		customModifiers: any[] = null;
		customAttributes: any[] = null;
		type: TypeReference = null;
		value: ConstantValue;

		toString() {
			return this.name + (this.value ? " = " + this.value : "");
		}

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readFieldSignature(this);
		}
	}

	export class FieldSignature {
		customModifiers: any[];
		type: TypeReference;
	}

	export class MethodDefinition {
		attributes: MethodAttributes = 0;
		implAttributes: MethodImplAttributes = 0;
		name: string = "";
		parameters: any[] = [];

		signature: MethodSignature = new MethodSignature();

		locals: any[] = [];

		// The MethodDefEntry.RVA column is computed when the image for the PE file is emitted
		// and points to the COR_ILMETHOD structure
		// for the body of the method (ECMA-335 para25.4)
		internalRva: number = 0;
		internalParamList: number = 0;

		toString() {
			var result = this.name;
			result += "(";
			if (this.parameters) {
				for (var i = 0; i < this.parameters.length; i++) {
					if (i>0)
						result += ", ";
					result += this.parameters[i];
					if (this.signature
						&& this.signature.parameters
						&& i < this.signature.parameters.length)
						result += ": " + this.signature.parameters[i].type;
				}
			}
			result += ")";
			return result;
		}

		internalReadRow(reader: TableStreamReader): void {
			this.internalRva = reader.readInt();
			this.implAttributes = reader.readShort();
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readMethodSignature(this.signature);

			this.internalParamList = reader.readTableRowIndex(TableKind.ParameterDefinition);
		}
	}

	export class CustomModifier {
		constructor(public required: boolean, public type: TypeReference) {
		}

		toString() {
			return (this.required ? "<req> " : "") + this.type;
		}
	}

	export class ParameterDefinition {
		attributes: number = 0;
		name: string = "";
		index: number = 0;

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.index = reader.readShort();
			this.name = reader.readString();
		}

		toString() {
			return this.name;
		}
	}

	export class PropertyDefinition {
		attributes: number = 0;
		name: string = "";
		
		isStatic: boolean = false;
		customAttributes: any[];
		customModifiers: any[];
		type: TypeReference;
		parameters: any[];

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readPropertySignature(this);
		}

		toString() {
			return this.name + (this.parameters ? "[" + this.parameters.length + "]" : "") + ":" + this.type;
		}
	}

	export class LocalVariable {
		type: TypeReference;
		customModifiers: any[];
		isPinned: boolean;
	}

	export class ExternalType extends TypeReference {
		constructor(public assemblyRef: any, private name: string, private namespace: string) {
			super();
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }

		internalReadRow(reader: TableStreamReader): void {
			this.assemblyRef = reader.readResolutionScope();

			this.name = reader.readString();
			this.namespace = reader.readString();
		}
	}

	export class PointerType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "*"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class ByRefType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "&"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class SZArrayType extends TypeReference {
		constructor(public elementType: TypeReference) {
			super();
		}

		getName() { return this.elementType.getName() + "[]"; }
		getNamespace() { return this.elementType.getNamespace(); }

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class SentinelType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "!sentinel"; }
		getNamespace() { return this.baseType.getNamespace(); }

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class KnownType extends TypeReference {
		private static byElementType: KnownType[] = [];

		constructor(private name: string, private internalElementType: ElementType) {
			super();
			KnownType.byElementType[internalElementType] = this;
		}

		getName() { return this.name; }
		getNamespace() { return "System"; }

		static internalGetByElementName(elementType: ElementType): KnownType {
			var result = KnownType.byElementType[elementType];
			return result;
		}

		static Void = new KnownType("Void", ElementType.Void);
		static Boolean = new KnownType("Boolean", ElementType.Boolean);
		static Char = new KnownType("Char", ElementType.Char);
		static SByte = new KnownType("SByte", ElementType.I1);
		static Byte = new KnownType("Byte", ElementType.U1);
		static Int16 = new KnownType("Int16", ElementType.I2);
		static UInt16 = new KnownType("UInt16", ElementType.U2);
		static Int32 = new KnownType("Int32", ElementType.I4);
		static UInt32 = new KnownType("UInt32", ElementType.U4);
		static Int64 = new KnownType("Int64", ElementType.I8);
		static UInt64 = new KnownType("UInt64", ElementType.U8);
		static Single = new KnownType("Single", ElementType.R4);
		static Double = new KnownType("Double", ElementType.R8);
		static String = new KnownType("String", ElementType.String);
		static TypedReference = new KnownType("TypedReference", ElementType.TypedByRef);
		static IntPtr = new KnownType("IntPtr", ElementType.I);
		static UIntPtr = new KnownType("UIntPtr", ElementType.U);
		static Object = new KnownType("Object", ElementType.Object);

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class GenericInstantiation extends TypeReference {
		genericType: TypeReference = null;
		arguments: TypeReference[] = null;

		getName(): string {
			return this.genericType.getName();
		}

		getNamespace(): string {
			return this.genericType.getNamespace();
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class FunctionPointerType extends TypeReference {
		methodSignature: MethodSignature = null;

		getName(): string {
			return this.methodSignature.toString();
		}

		getNamespace(): string {
			return "<function*>";
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class ArrayType extends TypeReference {
		constructor(public elementType: TypeReference, public dimensions: ArrayDimensionRange[]) {
			super();
		}

		getName(): string {
			return this.elementType.getName() + "[" + this.dimensions.join(", ") + "]";
		}

		getNamespace(): string {
			return this.elementType.getNamespace();
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class ArrayDimensionRange {
		lowBound: number = 0;
		length: number = 0;

		toString() {
			return this.lowBound + ".managed." + (this.lowBound + this.length - 1) + "]";
		}
	}

	export class MethodSignature {
		callingConvention: CallingConventions = 0;
		parameters: ParameterSignature[] = [];
		extraParameters: ParameterSignature[] = null;
		returnType: TypeReference = null;

		toString() {
			var result = "(" + this.parameters.join(", ");
			if (this.extraParameters && this.extraParameters.length) {
				if (result.length > 1)
					result += ", " + this.extraParameters.join(", ");
			}
			result += ")";
			result += " => " + this.returnType;
			return result;
		}
	}

	export class ParameterSignature {
		constructor(public customModifiers: any[], public type: TypeReference) {
		}

		toString() {
			return "_: " + this.type;
		}
	}

	export class ConstantValue {
		constructor(public type: TypeReference, public value: any) {
		}

		valueOf() { return this.value; }
	}

	export class CustomAttributeData {
		fixedArguments: any[];
		namedArguments: any[];
		constructor() {
		}
	}

	export class TableStreamReader {
		private stringHeapCache: string[] = [];

		constructor(
			private baseReader: io.BufferReader,
			private streams: MetadataStreams,
			private tables: any[][]) {

			this.readResolutionScope = this.createCodedIndexReader(
				TableKind.ModuleDefinition,
				TableKind.ModuleRef,
				TableKind.AssemblyRef,
				TableKind.ExternalType);

			this.readTypeDefOrRef = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.ExternalType,
				TableKind.TypeSpec);

			this.readHasConstant = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.ParameterDefinition,
				TableKind.PropertyDefinition);

			this.readHasCustomAttribute = this.createCodedIndexReader(
				TableKind.MethodDefinition,
				TableKind.FieldDefinition,
				TableKind.ExternalType,
				TableKind.TypeDefinition,
				TableKind.ParameterDefinition,
				TableKind.InterfaceImpl,
				TableKind.MemberRef,
				TableKind.ModuleDefinition,
				<TableKind>0xFFFF, // TableKind.Permission,
				TableKind.PropertyDefinition,
				TableKind.Event,
				TableKind.StandAloneSig,
				TableKind.ModuleRef,
				TableKind.TypeSpec,
				TableKind.AssemblyDefinition,
				TableKind.AssemblyRef,
				TableKind.File,
				TableKind.ExportedType,
				TableKind.ManifestResource,
				TableKind.GenericParam,
				TableKind.GenericParamConstraint,
				TableKind.MethodSpec);

			this.readCustomAttributeType = this.createCodedIndexReader(
				<TableKind>0xFFFF, //TableKind.Not_used_0,
				<TableKind>0xFFFF, //TableKind.Not_used_1,
				TableKind.MethodDefinition,
				TableKind.MemberRef,
				<TableKind>0xFFFF //TableKind.Not_used_4
			);

			this.readHasDeclSecurity = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.MethodDefinition,
				TableKind.AssemblyDefinition);

			this.readImplementation = this.createCodedIndexReader(
				TableKind.File,
				TableKind.AssemblyRef,
				TableKind.ExportedType);

			this.readHasFieldMarshal = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.ParameterDefinition);

			this.readTypeOrMethodDef = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.MethodDefinition);

			this.readMemberForwarded = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.MethodDefinition);

			this.readMemberRefParent = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.ExternalType,
				TableKind.ModuleRef,
				TableKind.MethodDefinition,
				TableKind.TypeSpec);

			this.readMethodDefOrRef = this.createCodedIndexReader(
				TableKind.MethodDefinition,
				TableKind.MemberRef);

			this.readHasSemantics = this.createCodedIndexReader(
				TableKind.Event,
				TableKind.PropertyDefinition);
		}

		readResolutionScope: () => any;
		readTypeDefOrRef: () => any;
		readHasConstant: () => any;
		readHasCustomAttribute: () => any;
		readCustomAttributeType: () => any;
		readHasDeclSecurity: () => any;
		readImplementation: () => any;
		readHasFieldMarshal: () => any;
		readTypeOrMethodDef: () => any;
		readMemberForwarded: () => any;
		readMemberRefParent: () => any;
		readMethodDefOrRef: () => any;
		readHasSemantics: () => any;

		readByte(): number { return this.baseReader.readByte(); }
		readInt(): number { return this.baseReader.readInt(); }
		readShort(): number { return this.baseReader.readShort(); }

		readString(): string {
			var pos = this.readPos(this.streams.strings.size);

			var result: string;
			if (pos == 0) {
				result = null;
			}
			else {
				result = this.stringHeapCache[pos];

				if (!result) {
					if (pos > this.streams.strings.size)
						throw new Error("String heap position overflow.");

					var saveOffset = this.baseReader.offset;
					this.baseReader.setVirtualOffset(this.streams.strings.address + pos);
					result = this.baseReader.readUtf8Z(1024 * 1024 * 1024); // strings longer than 1GB? Not supported for a security excuse.
					this.baseReader.offset = saveOffset;

					this.stringHeapCache[pos] = result;
				}
			}

			return result;
		}

		readGuid(): string {
			var index = this.readPos(this.streams.guids.length);

			if (index == 0)
				return null;
			else
				return this.streams.guids[(index - 1) / 16];
		}

		readBlobHex(): string {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = "";
			for (var i = 0; i < length; i++) {
				var hex = this.baseReader.readByte().toString(16);
				if (hex.length==1)
					result += "0";
				result += hex;
			}

			this.baseReader.offset = saveOffset;

			return result;
		}

		readBlob(): Uint8Array {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = this.baseReader.readBytes(length);

			this.baseReader.offset = saveOffset;

			return result;
		}

		private readBlobIndex(): number {
			return this.readPos(this.streams.blobs.size);
		}

		private readBlobSize(): number {
			var length;
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				length = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					length = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return length;
		}

		readTableRowIndex(tableIndex: number): number {
			var tableRows = this.tables[tableIndex];

			return this.readPos(tableRows ? tableRows.length : 0);
		}

		private createCodedIndexReader(...tableTypes: TableKind[]): () => any {
			var tableDebug = [];
			var maxTableLength = 0;
			for (var i = 0; i < tableTypes.length; i++) {

				var table = this.tables[tableTypes[i]];
				if (!table) {
					tableDebug.push(null);
					continue;
				}

				tableDebug.push(table.length);
				maxTableLength = Math.max(maxTableLength, table.length);
			}

			function calcRequredBitCount(maxValue) {
				var bitMask = maxValue;
				var result = 0;

				while (bitMask != 0) {
					result++;
					bitMask >>= 1;
				}

				return result;
			}

			var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
			var tableIndexBitCount = calcRequredBitCount(maxTableLength);
			//var debug = { maxTableLength: maxTableLength, calcRequredBitCount: calcRequredBitCount, tableLengths: tableDebug };

			return () => {
				var result = tableKindBitCount + tableIndexBitCount <= 16 ?
					this.baseReader.readShort() : // it fits within short
					this.baseReader.readInt(); // it does not fit within short

				//debug.toString();

				var resultIndex = result >> tableKindBitCount;
				var resultTableIndex = result - (resultIndex << tableKindBitCount);

				var table = tableTypes[resultTableIndex];

				if (resultIndex == 0)
					return null;

				resultIndex--;

				var row = this.tables[table][resultIndex];

				return row;
			};
		}

		private readPos(spaceSize: number): number {
			if (spaceSize < 65535)
				return this.baseReader.readShort();
			else
				return this.baseReader.readInt();
		}

		readMethodSignature(definition: MethodSignature): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			this.readSigMethodDefOrRefOrStandalone(definition);

			this.baseReader.offset = saveOffset;
		}

		readMethodSpec(instantiation: TypeReference[]): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x0A)
				throw new Error("Incorrect lead byte " + leadByte + " in MethodSpec signature.");

			var genArgCount = this.readCompressedInt();
			instantiation.length = genArgCount;

			for (var i = 0; i < genArgCount; i++) {
				var type = this.readSigTypeReference();
				instantiation.push(type);
			}

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.1, 23.2.2, 23.2.3
		private readSigMethodDefOrRefOrStandalone(sig: MethodSignature): void {
			var b = this.baseReader.readByte();

			sig.callingConvention = b;

			var genParameterCount = b & CallingConventions.Generic ?
				this.readCompressedInt() :
				0;

			var paramCount = this.readCompressedInt();

			var returnTypeCustomModifiers = this.readSigCustomModifierList();
			var returnType = this.readSigTypeReference();

			sig.parameters = [];

			sig.extraParameters =
				(sig.callingConvention & CallingConventions.VarArg)
				|| (sig.callingConvention & CallingConventions.C) ?
					[] :
					null;

			for (var i = 0; i < paramCount; i++) {
				var p = this.readSigParam();

				if (sig.extraParameters && sig.extraParameters.length > 0) {
					sig.extraParameters.push(p);
				}
				else {
					if (sig.extraParameters && this.baseReader.peekByte()===CallingConventions.Sentinel) {
						this.baseReader.offset++;
						sig.extraParameters.push(p);
					}
					else {
						sig.parameters.push(p);
					}
				}
			}
		}

		// ECMA-335 para23.2.4
		readFieldSignature(definition: FieldDefinition): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x06)
				throw new Error("Field signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			definition.customModifiers = this.readSigCustomModifierList();

			definition.type = this.readSigTypeReference();

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.5
		readPropertySignature(definition: PropertyDefinition): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (!(leadByte & 0x08))
				throw new Error("Property signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			definition.isStatic = !(leadByte & CallingConventions.HasThis);

			var paramCount = this.readCompressedInt();

			definition.customModifiers = this.readSigCustomModifierList();

			definition.type = this.readSigTypeReference();

			if (!definition.parameters)
				definition.parameters = [];
			definition.parameters.length = paramCount;

			for (var i = 0; i < paramCount; i++) {
				definition.parameters[i] = this.readSigParam();
			}

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.6, 23.2.9
		readSigLocalVar(): any[] {
			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x07)
				throw new Error("LocalVarSig signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			var count = this.readCompressedInt();
			var result: any[] = Array(count);

			for (var i = 0; i < count; i++) {
				var v = new LocalVariable();

				var varLeadByte = this.baseReader.peekByte();
				if (varLeadByte === ElementType.TypedByRef) {
					this.baseReader.offset++;
					v.type = KnownType.TypedReference;
				}
				else {
					while (true) {
						var cmod = this.readSigCustomModifierOrNull();
						if (cmod) {
							if (!v.customModifiers)
								v.customModifiers = [];
							v.customModifiers.push(cmod);
							continue;
						}

						// ECMA-335 para23.2.9
						if (this.baseReader.peekByte() === ElementType.Pinned) {
							this.baseReader.offset++;
							v.isPinned = true;
							continue;
						}
					}

					v.type = this.readSigTypeReference();
				}

				result.push(v);
			}

			return result;
		}

		// ECMA-335 para23.2.7
		private readSigCustomModifierOrNull(): any {
			var s = this.baseReader.peekByte();

			switch (s) {
				case ElementType.CMod_Opt:
					this.baseReader.offset++;
					return new CustomModifier(false, this.readSigTypeDefOrRefOrSpecEncoded());

				case ElementType.CMod_ReqD:
					this.baseReader.offset++;
					return new CustomModifier(true, this.readSigTypeDefOrRefOrSpecEncoded());

				default:
					return null;
			}
		}

		// ECMA-335 para23.2.8
		private readSigTypeDefOrRefOrSpecEncoded(): TypeReference {
			var uncompressed = this.readCompressedInt();
			var index = Math.floor(uncompressed / 4);
			var tableKind = uncompressed - index * 4;

			var table;
			switch (tableKind) {
				case 0:
					table = this.tables[TableKind.TypeDefinition];
					break;

				case 1:
					table = this.tables[TableKind.ExternalType];
					break;

				case 2:
					table = this.tables[TableKind.TypeSpec];
					break;

				default:
					throw new Error("Unknown table kind " + tableKind + " in encoded index.");
			}

			var typeReference = table[index];

			return typeReference.definition ? typeReference.definition : typeReference;
		}

		private readSigCustomModifierList(): any[] {
			var result: any[] = null;
			while (true) {
				var mod = this.readSigCustomModifierOrNull();

				if (!mod)
					return result;

				if (!result)
					result = [];

				result.push(mod);
			}
		}

		// ECMA-335 para23.2.10
		private readSigParam(): ParameterSignature {
			var customModifiers = this.readSigCustomModifierList();
			var type = this.readSigTypeReference();
			return new ParameterSignature(customModifiers, type);
		}

		// ECMA-335 para23.2.11, para23.2.12
		private readSigTypeReference(): TypeReference {
			var etype = this.baseReader.readByte();

			var directResult = KnownType.internalGetByElementName(etype);
			if (directResult)
				return directResult;

			switch (etype) {
				case ElementType.Ptr:
					return new PointerType(this.readSigTypeReference());

				case ElementType.ByRef:
					return new ByRefType(this.readSigTypeReference());

				case ElementType.ValueType:
					var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
					//value_type.isValueType = true;
					return value_type;

				case ElementType.Class:
					var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
					//value_type.isValueType = false;
					return value_type;

				case ElementType.Var:
					var varIndex = this.readCompressedInt();
					return new Var(varIndex);

				case ElementType.Array:
					var arrayElementType = this.readSigTypeReference();
					return this.readSigArrayShape(arrayElementType);

				case ElementType.GenericInst: {
					var genInst = new GenericInstantiation();

					var genLead = this.baseReader.readByte();
					var isValueType;
					switch (genLead) {
						case ElementType.Class: (<any>genInst).isValueType = false; break;
						case ElementType.ValueType: (<any>genInst).isValueType = true; break;
						default: throw new Error("Unexpected lead byte 0x" + genLead.toString(16).toUpperCase() + " in GenericInst type signature.");
					}

					genInst.genericType = this.readSigTypeDefOrRefOrSpecEncoded();
					var genArgCount = this.readCompressedInt();
					genInst.arguments = Array(genArgCount);
					for (var iGen = 0; iGen < genArgCount; iGen++) {
						genInst.arguments.push(this.readSigTypeReference());
					}

					return genInst;
				}

				case ElementType.FnPtr:
					var fnPointer = new FunctionPointerType();
					fnPointer.methodSignature = new MethodSignature();
					this.readSigMethodDefOrRefOrStandalone(fnPointer.methodSignature);
					return fnPointer;

				case ElementType.SZArray:
					return new SZArrayType(this.readSigTypeReference());

				case ElementType.MVar:
					var mvarIndex = this.readCompressedInt();
					return new MVar(mvarIndex);

				case ElementType.Sentinel:
					return new SentinelType(this.readSigTypeReference());

				case ElementType.Pinned:
				case ElementType.End:
				case ElementType.Internal:
				case ElementType.Modifier:
				case ElementType.R4_Hfa:
				case ElementType.R8_Hfa:
				case ElementType.ArgumentType_:
				case ElementType.CustomAttribute_BoxedObject_:
				case ElementType.CustomAttribute_Field_:
				case ElementType.CustomAttribute_Property_:
				case ElementType.CustomAttribute_Enum_:
				default:
					throw new Error("Unknown element type " + io.formatEnum(etype, ElementType)+".");
			}
		}

		// ECMA-335 para23.2.13
		private readSigArrayShape(arrayElementType: TypeReference): TypeReference {
			var rank = this.readCompressedInt();
			var dimensions: ArrayDimensionRange[] = Array(rank);
			for (var i = 0; i < rank; i++) {
				dimensions[i] = new ArrayDimensionRange();
			}

			var numSizes = this.readCompressedInt();
			for (var i = 0; i < numSizes; i++) {
				dimensions[i].length = this.readCompressedInt();
			}

			var numLoBounds = this.readCompressedInt();
			for (var i = 0; i < numLoBounds; i++) {
				dimensions[i].lowBound = this.readCompressedInt();
			}

			return new ArrayType(
				arrayElementType,
				dimensions);
		}

		readMemberSignature(): any {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result;

			var leadByte = this.baseReader.peekByte();
			if (leadByte & 0x05) {
				this.baseReader.offset++;
				result = new FieldSignature();
				result.customModifiers = this.readSigCustomModifierOrNull();
				result.type = this.readSigTypeReference();
			}
			else {
				result = new MethodSignature();
				this.readSigMethodDefOrRefOrStandalone(result);
			}

			this.baseReader.offset = saveOffset;

			return result;
		}

		// ECMA-335 paraII.23.2
		private readCompressedInt(): number {
			var result;
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				result = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					result = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					result = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return result;
		}

		// ECMA-335 paraII.22.9
		readConstantValue(etype: ElementType): any {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = this.readSigValue(etype, length);

			this.baseReader.offset = saveOffset;

			return result;
		}

		// ECMA-335 paraII.22.9 (in part of reading the actual value)
		private readSigValue(etype: ElementType, length: number): any {

			switch (etype) {
				case ElementType.Boolean:
					return this.baseReader.readByte() !== 0;
				case ElementType.Char:
					return String.fromCharCode(this.baseReader.readShort());
				case ElementType.I1:
					var result = this.baseReader.readByte();
					if (result > 0x7f)
						result -= 0xff;
					return result;
				case ElementType.U1:
					return this.baseReader.readByte();
				case ElementType.I2:
					var result = this.baseReader.readShort();
					if (result > 0x7fff)
						result -= 0xffff;
					return result;
				case ElementType.U2:
					return this.baseReader.readShort();
				case ElementType.I4:
					var result = this.baseReader.readInt();
					if (result > 0x7fffffff)
						result -= 0xffffffff;
					return result;
				case ElementType.U4:
					return this.baseReader.readInt();
				case ElementType.I8:
				case ElementType.U8:
					return this.baseReader.readLong();
				case ElementType.R4:
					return this.baseReader.readInt();
				case ElementType.R8:
					return this.baseReader.readLong();
				case ElementType.String:
					var stringValue = "";
					for (var iChar = 0; iChar < length / 2; iChar++) {
						stringValue += String.fromCharCode(this.baseReader.readShort());
					}
					return stringValue;
				case ElementType.Class:
					var classRef = this.baseReader.readInt();
					if (classRef === 0)
						return null;
					else
						return classRef;
				default:
					return "Unknown element type " + etype + ".";
			}
		}

		// ECMA-335 paraII.2.3
		readCustomAttribute(ctorSignature: MethodSignature): CustomAttributeData {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var customAttribute = new CustomAttributeData();

			var prolog = this.baseReader.readShort();
			if (prolog !== 0x0001)
				throw new Error("Incorrect prolog value 0x" + prolog.toString(16).toUpperCase() + " for CustomAttribute.");

			customAttribute.fixedArguments = [];
			for (var i = 0; i < ctorSignature.parameters.length; i++) {
				var pType: any = ctorSignature.parameters[i].type;
				customAttribute.fixedArguments.push(this.readSigFixedArg(pType));
			}

			var numNamed = this.baseReader.readShort(); // not compressed short here
			for (var i = 0; i < numNamed; i++) {
				var namedLeadByte = this.baseReader.readByte();
				var isField;
				switch (namedLeadByte) {
					case 0x53: isField = true;
					case 0x54: isField = false;
					default:
						throw new Error("Incorrect leading byte " + namedLeadByte + " for named CustomAttribute argument.");
				}

				var fieldOrPropType = this.readSigFieldOrPropType();
				var fieldOrPropName = this.readSigSerString();
				var value = this.readSigFixedArg(fieldOrPropType);
				customAttribute.namedArguments.push({ name: fieldOrPropName, type: fieldOrPropType, value: value });
			}

			this.baseReader.offset = saveOffset;

			return customAttribute;
		}

		private readSigFixedArg(type: TypeReference) {
			var isArray = (<any>type).elementType && !(<any>type).dimensions;

			if (isArray) {
				var szElements = [];
				var numElem = this.baseReader.readInt(); // not compressed int here
				for (var i = 0; i < numElem; i++) {
					szElements.push(this.readSigElem((<any>type).elementType));
				}
				return szElements;
			}
			else {
				return this.readSigElem(type);
			}
		}

		private readSigFieldOrPropType(): any {
			var etype = this.baseReader.readByte();

			var result = KnownType.internalGetByElementName(etype);
			if (result)
				return result;

			switch (etype) {
				case ElementType.SZArray:
					var elementType = this.readSigFieldOrPropType();
					return new SZArrayType(elementType);

				case ElementType.CustomAttribute_Enum_:
					var enumName = this.readSigSerString();
					return new ExternalType(null, null, enumName);
			}
		}

		private readSigSerString(): string {
			if (this.baseReader.peekByte()===0xff)
				return null;

			var packedLen = this.readCompressedInt();
			var result = this.baseReader.readUtf8Z(packedLen);
			return result;
		}

		private readSigElem(type: TypeReference): any {
			//switch (type) {
			//	case KnownType.Boolean:
			//		return new ConstantValue(this.baseReader.readByte() !== 0;

			//	case KnownType.Char:
			//		return String.fromCharCode(this.baseReader.readShort());

			//	case KnownType.Single:
			//		return { raw: this.baseReader.readInt() };

			//	case KnownType.Double:
			//		return { raw: this.baseReader.readLong() };

			//	case KnownType.Byte:
			//		return this.baseReader.readByte();

			//	case KnownType.Int16:
			//}
		}
	}

	export class TableStream {
		reserved0: number = 0;
		version: string = "";

		// byte
		heapSizes: number = 0;

		reserved1: number = 0;

		tables: any[][] = null;

		externalTypes: ExternalType[] = [];

		module: ModuleDefinition = null;
		assembly: AssemblyDefinition = null;

		read(tableReader: io.BufferReader, streams: MetadataStreams) {
			this.reserved0 = tableReader.readInt();

			// Note those are bytes, not shorts!
			this.version = tableReader.readByte() + "." + tableReader.readByte();

			this.heapSizes = tableReader.readByte();
			this.reserved1 = tableReader.readByte();

			var valid = tableReader.readLong();
			var sorted = tableReader.readLong();

			var tableCounts = this.readTableCounts(tableReader, valid);

			this.initTables(tableReader, tableCounts);
			this.readTables(tableReader, streams);
		}

		private readTableCounts(reader: io.BufferReader, valid: io.Long): number[] {
			var result = [];

			var bits = valid.lo;
			for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			bits = valid.hi;
			for (var i = 0; i < 32; i++) {
				var tableIndex = i + 32;
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			return result;
		}

		private initTables(reader: io.BufferReader, tableCounts: number[]) {
			this.tables = [];
			var tableTypes = [];

			for (var tk in TableKind) {
				if (!TableKind.hasOwnProperty(tk))
					continue;

				var tkValue = TableKind[tk];
				if (typeof(tkValue)!=="number")
					continue;

				tableTypes[tkValue] = managed[tk];
			}

			for (var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
				var rowCount = tableCounts[tableIndex];
				if (!rowCount)
					continue;

				this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
			}
		}

		private initTable(tableIndex: number, rowCount: number, TableType) {
			var tableRows = this.tables[tableIndex] = Array(rowCount);

			// first module is the current module
			if (tableIndex === TableKind.ModuleDefinition && tableRows.length > 0) {
				tableRows[0] = this.module;
			}

			if (tableIndex === TableKind.AssemblyDefinition && tableRows.length > 0) {
				tableRows[0] = this.assembly;
			}

			for (var i = 0; i < rowCount; i++) {
				if (!tableRows[i])
					tableRows[i] = new TableType();

				if (i===0 && tableRows[i].isSingleton)
					break;
			}
		}

		private readTables(reader: io.BufferReader, streams: MetadataStreams) {
			var tableStreamReader = new TableStreamReader(
				reader,
				streams,
				this.tables);

			for (var tableIndex = 0; tableIndex < 64; tableIndex++) {
				var tableRows = this.tables[tableIndex];

				if (!tableRows)
					continue;

				var singletonRow = null;

				for (var i = 0; i < tableRows.length; i++) {
					if (singletonRow) {
						singletonRow.internalReadRow(tableStreamReader);
						continue;
					}

					tableRows[i].internalReadRow(tableStreamReader);

					if (i === 0) {
						if (tableRows[i].isSingleton)
							singletonRow = tableRows[i];
					}
				}
			}
		}
	}

	export class AssemblyReader {
		
		read(reader: io.BufferReader, assembly: AssemblyDefinition) {
			if (!assembly.headers) {
				assembly.headers = new headers.PEFileHeaders();
				assembly.headers.read(reader);
			}

			reader.sections = assembly.headers.sectionHeaders;

			// read main managed headers
			reader.setVirtualOffset(assembly.headers.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr].address);

			var cdi = new ClrDirectory();
			cdi.read(reader);

			var saveOffset = reader.offset;
			reader.setVirtualOffset(cdi.metadataDir.address);

			var cme = new ClrMetadata();
			cme.read(reader);

			var mes = new MetadataStreams();
			mes.read(cdi.metadataDir.address, cme.streamCount, reader);

			// populate assembly with what's known already
			// (flags, CLR versions etc.)

			if (!assembly.modules)
				assembly.modules = [];

			if (!assembly.modules[0])
				assembly.modules[0] = new ModuleDefinition();

			var mainModule = assembly.modules[0];
			mainModule.runtimeVersion = cdi.runtimeVersion;
			mainModule.imageFlags = cdi.imageFlags;

			mainModule.specificRuntimeVersion = cme.runtimeVersion;


			// reading tables

			reader.setVirtualOffset(mes.tables.address);
			var tas = new TableStream();
			tas.module = mainModule;
			tas.assembly = assembly;
			tas.read(reader, mes);


			this.populateTypes(mainModule, tas.tables);

			if (tas.tables[TableKind.ExternalType]) {
				mainModule.debugExternalTypeReferences = tas.tables[TableKind.ExternalType];
			}
			
			this.populateMembers(
				tas.tables[TableKind.TypeDefinition],
				(parent: TypeDefinition) => parent.internalFieldList,
				(parent: TypeDefinition) => parent.fields,
				tas.tables[TableKind.FieldDefinition],
				(child: FieldDefinition) => child);

			this.populateMembers(
				tas.tables[TableKind.TypeDefinition],
				(parent: TypeDefinition) => parent.internalMethodList,
				(parent: TypeDefinition) => parent.methods,
				tas.tables[TableKind.MethodDefinition],
				(child: MethodDefinition) => child);

			this.populateMembers(
				tas.tables[TableKind.MethodDefinition],
				(parent: MethodDefinition) => parent.internalParamList,
				(parent: MethodDefinition) => parent.parameters,
				tas.tables[TableKind.ParameterDefinition],
				(child: ParameterDefinition) => child);

			reader.offset = saveOffset;
		}

		private populateTypes(mainModule: ModuleDefinition, tables: any[]) {
			mainModule.types = tables[TableKind.TypeDefinition];

			if (!mainModule.types)
				mainModule.types = [];

		}

		private populateMembers(
			parentTable: any[],
			getChildIndex: (parent: any) => number,
			getChildren: (parent: any) => any[],
			childTable: any[],
			getChildEntity: (child: any) => any) {
			if (!parentTable)
				return;

			var childIndex = 0;
			for (var iParent = 0; iParent < parentTable.length; iParent++) {
				var childCount =
					!childTable ? 0 :
					iParent + 1 < parentTable.length ?
						getChildIndex(parentTable[iParent + 1]) - 1 - childIndex :
						childTable.length - childIndex;

				var parent = parentTable[iParent];

				var children = getChildren(parent);

				children.length = childCount;

				for (var iChild = 0; iChild < childCount; iChild++) {
					var entity = getChildEntity(childTable[childIndex + iChild]);
					children[iChild] = entity;
				}

				childIndex += childCount;
			}
		}
	}

	// This record should not be emitted into any PE file.
	// However, if present in a PE file, it shall be treated as if all its fields were zero.
	// It shall be ignored by the CLI.
	// [ECMA-335 para22.3]
	export class AssemblyOS {
		osplatformID: number;
		osVersion: string;

		internalReadRow(reader: TableStreamReader): void {
			this.osplatformID = reader.readInt();
			this.osVersion = reader.readInt() + "." + reader.readInt();
		}
	}

	// This record should not be emitted into any PE file.
	// However, if present in a PE file, it should be treated as if its field were zero.
	// It should be ignored by the CLI.
	// [ECMA-335 para22.4]
	export class AssemblyProcessor {
		processor: number;

		internalReadRow(reader: TableStreamReader): void {
			this.processor = reader.readInt();
		}
	}

	// The AssemblyRef table shall contain no duplicates
	// (where duplicate rows are deemd to be those having the same
	// MajorVersion, MinorVersion, BuildNumber, RevisionNumber, PublicKeyOrToken, Name, and Culture). [WARNING]
	// [ECMA-335 para22.5]
	export class AssemblyRef {
		definition: AssemblyDefinition;

		// HashValue can be null or non-null.
		// If non-null, then HashValue shall index a non-empty 'blob' in the Blob heap. [ERROR]
		hashValue: string;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new AssemblyDefinition();

			this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.definition.flags = reader.readInt();
			this.definition.publicKey = reader.readBlobHex();
			this.definition.name = reader.readString();
			this.definition.culture = reader.readString();
			this.hashValue = reader.readBlobHex();
		}

		toString() {
			return this.definition + " #" + this.hashValue;
		}
	}

	// These records should not be emitted into any PE file.
	// However, if present in a PE file, they should be treated as-if their fields were zero.
	// They should be ignored by the CLI.
	// [ECMA-335 para22.6]
	export class AssemblyRefOS {
		definition: AssemblyDefinition;
		hashValue: string;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new AssemblyDefinition();

			this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.definition.flags = reader.readInt();
			this.definition.publicKey = reader.readBlobHex();
			this.definition.name = reader.readString();
			this.definition.culture = reader.readString();
			this.hashValue = reader.readBlobHex();
		}
	}

	// These records should not be emitted into any PE file.
	// However, if present in a PE file, they should be treated as-if their fields were zero.
	// They should be ignored by the CLI.
	// [ECMA-335 para22.7]
	export class AssemblyRefProcessor {
		processor: number;

		internalReadRow(reader: TableStreamReader): void {
			this.processor = reader.readInt();
		}
	}

	// The ClassLayout table is used to define how the fields of a class or value type shall be laid out by the CLI.
	// (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
	// A ClassLayout table can contain zero or more rows.
	// [ECMA-335 para22.8]
	// The rows of the ClassLayout table are defined
	// by placing .pack and .size directives on the body of the type declaration
	// in which this type is declared (ECMA-335 para10.2).
	// When either of these directives is omitted, its corresponding value is zero.  (See ECMA-335 para10.7.)
	export class ClassLayout {
		// If Parent indexes a SequentialLayout type, then:
		// * PackingSize shall be one of {0, 1, 2, 4, 8, 16, 32, 64, 128}.
		// (0 means use the default pack size for the platform on which the application is running.) [ERROR]
		// If Parent indexes an ExplicitLayout type, then
		// * PackingSize shall be 0.
		packingSize: number;

		// ClassSize of zero does not mean the class has zero size.
		// It means that no .size directive was specified at definition time,
		// in which case, the actual size is calculated from the field types,
		// taking account of packing size (default or specified) and natural alignment on the target, runtime platform.
		// If Parent indexes a ValueType, then ClassSize shall be less than 1 MByte (0x100000 bytes). [ERROR]
		classSize: number;

		// Parent shall index a valid row in the TypeDef table, corresponding to a Class or ValueType (but not to an Interface). [ERROR]
		// The Class or ValueType indexed by Parent shall be SequentialLayout or ExplicitLayout (ECMA-335 para23.1.15).
		// (That is, AutoLayout types shall not own any rows in the ClassLayout table.) [ERROR]
		// (It makes no sense to provide explicit offsets for each field, as well as a packing size.)  [ERROR]
		parent: number;

		internalReadRow(reader: TableStreamReader): void {
			this.packingSize = reader.readShort();
			this.classSize = reader.readInt();
			this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
		}
	}

	export class ClrDirectory {
		private static clrHeaderSize = 72;
		
		cb: number = 0;
		runtimeVersion: string = "";
		imageFlags: ClrImageFlags = 0;
		metadataDir: io.AddressRange = null;
		entryPointToken: number = 0;
		resourcesDir: io.AddressRange = null;
		strongNameSignatureDir: io.AddressRange = null;
		codeManagerTableDir: io.AddressRange = null;
		vtableFixupsDir: io.AddressRange = null;
		exportAddressTableJumpsDir: io.AddressRange = null;
		managedNativeHeaderDir: io.AddressRange = null;

		read(clrDirReader: io.BufferReader) {
			// CLR header
			this.cb = clrDirReader.readInt();

			if (this.cb < ClrDirectory.clrHeaderSize)
				throw new Error(
					"Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
					"(expected at least " + ClrDirectory.clrHeaderSize + ").");

			this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

			this.metadataDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.imageFlags = clrDirReader.readInt();

			// need to convert to meaningful value before sticking into ModuleDefinition
			this.entryPointToken = clrDirReader.readInt();

			this.resourcesDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.strongNameSignatureDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.codeManagerTableDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.vtableFixupsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.exportAddressTableJumpsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.managedNativeHeaderDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());
		}
	}

	export class ClrMetadata {

		mdSignature: ClrMetadataSignature = ClrMetadataSignature.Signature;
		metadataVersion: string = "";
		runtimeVersion: string = "";
		mdReserved: number = 0;
		mdFlags: number = 0;
		streamCount: number = 0;
		
		read(reader: io.BufferReader) {
			this.mdSignature = reader.readInt();
			if (this.mdSignature != ClrMetadataSignature.Signature)
				throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

			this.metadataVersion = reader.readShort() + "." + reader.readShort();

			this.mdReserved = reader.readInt();

			var metadataStringVersionLength = reader.readInt();
			this.runtimeVersion = reader.readZeroFilledAscii(metadataStringVersionLength);

			this.mdFlags = reader.readShort();

			this.streamCount = reader.readShort();
		}
	}

	// The Constant table is used to store compile-time, constant values for fields, parameters, and properties.
	// [ECMA-335 para22.9]
	export class Constant {
		isSingleton = true;

		internalReadRow(reader: TableStreamReader): void {
			var type = reader.readByte();
			var padding = reader.readByte();
			var parent = reader.readHasConstant();
			var constValue = new ConstantValue(KnownType.internalGetByElementName(type), reader.readConstantValue(type));
			parent.value = constValue;
		}
	}

	// The TableKind.CustomAttribute table stores data that can be used to instantiate a Custom Attribute
	// (more precisely, an object of the specified Custom Attribute class) at runtime.
	// The column called Type is slightly misleading --
	// it actually indexes a constructor method --
	// the owner of that constructor method is the Type of the Custom Attribute.
	// A row in the CustomAttribute table for a parent is created by the .custom attribute,
	// which gives the value of the Type column and optionally that of the Value column (ECMA-335 para21).
	// [ECMA-335 para22.10]
	// All binary values are stored in little-endian format
	// (except for PackedLen items, which are used only as a count for the number of bytes to follow in a UTF8 string).
	export class CustomAttribute {
		// Parent can be an index into any metadata table, except the TableKind.CustomAttribute table itself  [ERROR]
		parent: any;

		// Type shall index a valid row in the TableKind.Method or TableKind.MemberRef table.
		// That row shall be a constructor method
		// (for the class of which this information forms an instance)  [ERROR]
		type: any;

		value: CustomAttributeData;

		internalReadRow(reader: TableStreamReader): void {
			this.parent = reader.readHasCustomAttribute();

			this.type = reader.readCustomAttributeType();

			var attrBlob = reader.readBlob();
			this.value = new CustomAttributeData();
		}
	}

	// All security custom attributes for a given security action on a method, type, or assembly shall be gathered together,
	// and one System.Security.PermissionSet instance shall be created, stored in the Blob heap, and referenced from the TableKind.DeclSecurity table.
	// [ECMA-335 para22.11]
	// The general flow from a compiler�s point of view is as follows.
	// The user specifies a custom attribute through some language-specific syntax that encodes a call to the attribute�s constructor.
	// If the attribute�s type is derived (directly or indirectly) from System.Security.Permissions.SecurityAttribute
	// then it is a security custom attribute and requires special treatment, as follows
	// (other custom attributes are handled by simply recording the constructor in the metadata as described in ECMA-335 para22.10).
	// The attribute object is constructed, and provides a method (CreatePermission)
	// to convert it into a security permission object (an object derived from System.Security.Permission).
	// All the permission objects attached to a given metadata item with the same security action are combined together into a System.Security.PermissionSet.
	// This permission set is converted into a form that is ready to be stored in XML using its ToXML method
	// to create a System.Security.SecurityElement.
	// Finally, the XML that is required for the metadata is created using the ToString method on the security element.
	export class DeclSecurity {
		action: SecurityAction;

		// An index into the TabeKind.TypeDef, TableKind.MethodDefinition, or TableKind.Assembly table;
		// more precisely, a HasDeclSecurity (ECMA-335 para24.2.6) coded index.
		parent: any;

		permissionSet: string;

		internalReadRow(reader: TableStreamReader): void {
			this.action = reader.readShort();
			this.parent = reader.readHasDeclSecurity();
			this.permissionSet = <any>reader.readBlob();
		}
	}

	// For each row, there shall be one add_ and one remove_ row in the TableKind.MethodSemantics table. [ERROR]
	// For each row, there can be zero or one raise_ row, as well as zero or more other rows in the TableKind.MethodSemantics table. [ERROR]
	// [ECMA-335 para22.13]
	// Events are treated within metadata much like Properties;
	// that is, as a way to associate a collection of methods defined on a given class.
	// There are two required methods (add_ and remove_) plus an optional one (raise_);
	// additonal methods with other names are also permitted (ECMA-335 para18).
	// All of the methods gathered together as an TableKind.Event shall be defined on the class (ECMA-335 paraI.8.11.4)
	// the association between a row in the TableKind.TypeDef table and the collection of methods
	// that make up a given Event is held in three separate tables (exactly analogous to the approach used for Properties).
	// Event tables do a little more than group together existing rows from other tables.
	// The TableKind.Event table has columns for EventFlags, Name, and EventType.
	// In addition, the TableKind.MethodSemantics table has a column to record whether the method it indexes is an add_, a remove_, a raise_, or other function.
	export class Event {
		// A 2-byte bitmask of type EventAttributes, ECMA-335 para23.1.4.
		eventFlags: EventAttributes;

		// Name shall index a non-empty string in the String heap. [ERROR]
		name: string;

		// An index into a TableKind.TypeDef, a TableKind.TypeRef, or TableKind.TypeSpec table;
		// more precisely, a TableKind.TypeDefOrRef (ECMA-335 para24.2.6) coded index.
		// This corresponds to the Type of the EventEntry; it is not the Type that owns this event.
		// EventType can be null or non-null.
		eventType: any;

		internalReadRow(reader: TableStreamReader): void {
			this.eventFlags = reader.readShort();
			this.name = reader.readString();
			this.eventType = reader.readTypeDefOrRef();
		}
	}

	// There shall be no duplicate rows, based upon Parent
	// (a given class has only one 'pointer' to the start of its event list). [ERROR]
	// There shall be no duplicate rows, based upon EventList
	// (different classes cannot share rows in the TableKind.Event table). [ERROR]
	// [ECMA-335 para22.12]
	// Note that TableKind.EventMap info does not directly influence runtime behavior;
	// what counts is the information stored for each method that the event comprises.
	// The TableKind.EventMap and TableKind.Event tables result from putting the .event directive on a class (ECMA-335 para18).
	export class EventMap {
		// An index into the TableKind.TypeDef table.
		parent: number;

		// An index into the TableKind.Event table.
		// It marks the first of a contiguous run of Events owned by this Type.
		eventList: number;

		internalReadRow(reader: TableStreamReader): void {
			this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.eventList = reader.readTableRowIndex(TableKind.Event);
		}
	}

	// The TableKind.ExportedType table holds a row for each type:
	// a. Defined within other modules of this Assembly; that is exported out of this Assembly.
	// In essence, it stores TableKind.TypeDef row numbers of all types
	// that are marked public in other modules that this Assembly comprises.
	// The actual target row in a TableKind.TypeDef table is given by the combination of TypeDefId
	// (in effect, row number) and Implementation (in effect, the module that holds the target TableKind.TypeDef table).
	// Note that this is the only occurrence in metadata of foreign tokens;
	// that is, token values that have a meaning in another module.
	// (A regular token value is an index into a table in the current module);
	// OR
	// b. Originally defined in this Assembly but now moved to another Assembly.
	// Flags must have TypeAttributes.IsTypeForwarder set
	// and Implementation is an TableKind.AssemblyRef
	// indicating the Assembly the type may now be found in.
	// The full name of the type need not be stored directly.
	// Instead, it can be split into two parts at any included '.'
	// (although typically this is done at the last '.' in the full name).
	// The part preceding the '.' is stored as the TypeNamespace
	// and that following the '.' is stored as the TypeName.
	// If there is no '.' in the full name,
	// then the TypeNamespace shall be the index of the empty string.
	// [ECMA-335 para22.14]
	// The rows in the TableKind. table are the result of the .class extern directive (ECMA-335 para6.7).
	export class ExportedType {
		// A 4-byte bitmask of type TypeAttributes, ECMA-335 para23.1.15.
		flags: TypeAttributes;

		// A 4-byte index into a TableKind.TypeDef table of another module in this Assembly.
		// This column is used as a hint only.
		// If the entry in the target TableKind.TypeDef table
		// matches the TypeName and TypeNamespace entries in this table,
		// resolution has succeeded.
		// But if there is a mismatch, the CLI shall fall back to a search
		// of the target TableKind.TypeDef table.
		// Ignored and should be zero if Flags has TypeAttributes.IsTypeForwarder set.
		typeDefId: number;

		typeName: string;

		typeNamespace: string;

		// This is an index (more precisely, an Implementation (ECMA-335 para24.2.6) coded index)
		// into either of the following tables:
		// * TableKind.File table, where that entry says which module in the current assembly holds the TableKind.TypeDef;
		// * TableKind.ExportedType table, where that entry is the enclosing Type of the current nested Type;
		// * TableKind.AssemblyRef table, where that entry says in which assembly the type may now be found
		// (Flags must have the TypeAttributes.IsTypeForwarder flag set).
		implementation: any;

		internalReadRow(reader: TableStreamReader): void {
			this.flags = reader.readInt();
			this.typeDefId = reader.readInt();
			this.typeName = reader.readString();
			this.typeNamespace = reader.readString();
			this.implementation = reader.readImplementation();
		}
	}

	// Note that each Field in any Type is defined by its Signature.
	// When a Type instance (i.e., an object) is laid out by the CLI, each Field is one of four kinds:
	// * Scalar: for any member of built-in type, such as int32.
	// The size of the field is given by the size of that intrinsic, which varies between 1 and 8 bytes.
	// * ObjectRef: for ElementType.Class, ElementType.String, ElementType.Object,
	// ElementType.Array, ElementType.SZArray.
	// * Pointer: for ElementType.Ptr, ElementType.FNPtr.
	// * ValueType: for ElementType.VaueType.
	// The instance of that ValueType is actually laid out in this object,
	// so the size of the field is the size of that ValueType.
	// Note that metadata specifying explicit structure layout can be valid for use on one platform but not on another,
	// since some of the rules specified here are dependent on platform-specific alignment rules.
	// [ECMA-335 para22.16]
	// A row in the TableKind.FieldLayout table is created if the .field directive for the parent field has specified a field offset (ECMA-335 para16).
	export class FieldLayout {
		// Offset shall be zero or more. [ERROR]
		// Among the rows owned by a given Type it is perfectly  valid for several rows to have the same value of Offset.
		// ElementType.ObjectRef and a ElementType.ValueType cannot have the same offset. [ERROR]
		// Every Field of an ExplicitLayout Type shall be given an offset;
		// that is, it shall have a row in the FieldLayout table. [ERROR]
		offset: number;

		// An index into the Field table.
		field: number;

		internalReadRow(reader: TableStreamReader): void {
			this.offset = reader.readInt();
			this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
		}
	}

	// The TabeKind.FieldMarshal table has two columns.
	// It 'links' an existing row in the TableKind.Field or TabeKind.Param table,
	// to information in the Blob heap that defines how that field or parameter
	// (which, as usual, covers the method return, as parameter number 0)
	// shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
	// [ECMA-335 para22.17]
	// Note that TableKind.FieldMarshal information is used only by code paths that arbitrate operation with unmanaged code.
	// In order to execute such paths, the caller, on most platforms, would be installed with elevated security permission.
	// Once it invokes unmanaged code, it lies outside the regime that the CLI can check--it is simply trusted not to violate the type system.
	// A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute (para16.1).
	export class FieldMarshal {
		// An index into TableKind.Field or TableKind.Param table;
		// more precisely, a HasFieldMarshal (ECMA-335 para24.2.6) coded index.
		parent: any;

		// An index into the Blob heap.
		// For the detailed format of the 'blob', see ECMA-335 para23.4.
		nativeType: MarshalSpec;

		internalReadRow(reader: TableStreamReader): void {
			this.parent = reader.readHasFieldMarshal();
			this.nativeType = new MarshalSpec(reader.readBlob());
		}
	}

	export class MarshalSpec {
		constructor(public blob: any) {
		}
	}


	// Conceptually, each row in the TableKind.FieldRVA table is an extension to exactly one row in the TableKind.Field table,
	// and records the RVA (Relative Virtual Address) within the image file at which this field�s initial value is stored.
	// A row in the TableKind.FieldRVA table is created for each static parent field that has specified the optional data label (ECMA-335 para16).
	// The RVA column is the relative virtual address of the data in the PE file (ECMA-335 para16.3).
	// [ECMA-335 para22.18]
	export class FieldRVA {
		// A 4-byte constant.
		rva: number;

		// An index into TableKind.Field table.
		field: number;

		internalReadRow(reader: TableStreamReader): void {
			this.rva = reader.readInt();
			this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
		}
	}

	// [ECMA-335 para22.19]
	export class File {
		// A 4-byte bitmask of type FileAttributes, ECMA-335 para23.1.6.
		// If this module contains a row in the TableKind.Assembly table
		// (that is, if this module 'holds the manifest')
		// then there shall not be any row in the TableKind.File table for this module; i.e., no self-reference. [ERROR]
		// If the TableKind.File table is empty, then this, by definition, is a single-file assembly.
		// In this case, the TableKind.ExportedType table should be empty  [WARNING]
		flags: FileAttributes;

		// Name shall index a non-empty string in the String heap.
		// It shall be in the format filename.extension  (e.g., 'foo.dll', but not 'c:\utils\foo.dll'). [ERROR]
		// There shall be no duplicate rows; that is, rows with the same Name value. [ERROR]
		name: string;

		// HashValue shall index a non-empty 'blob' in the Blob heap. [ERROR]
		hashValue: string;

		internalReadRow(reader: TableStreamReader): void {
			this.flags = reader.readInt();
			this.name = reader.readString();
			this.hashValue = reader.readBlobHex();
		}
	}

	// The TableKind.GenericParam table stores the generic parameters used in generic type definitions and generic method definitions.
	// These generic parameters can be constrained
	// (i.e., generic arguments shall extend some class and/or implement certain interfaces)
	// or unconstrained.
	// (Such constraints are stored in the TableKind.GenericParamConstraint table.)
	// Conceptually, each row in the TableKind.GenericParam table is owned by one, and only one, row
	// in either the TableKind.TypeDef or TableKind.MethodDefinition tables.
	// [ECMA-335 para22.20]
	export class GenericParam {
		// The 2-byte index of the generic parameter, numbered left-to-right, from zero.
		number: number;

		// A 2-byte bitmask of type GenericParamAttributes, ECMA-335 para23.1.7.
		flags: GenericParamAttributes;

		// An index into the TableKind.TypeDef or TableKind.MethodDefinition table,
		// specifying the Type or Method to which this generic parameter applies;
		// more precisely, a TypeOrMethodDef (ECMA-335 para24.2.6) coded index.
		// The following additional restrictions apply:
		// * Owner cannot be a non nested enumeration type; and
		// * If Owner is a nested enumeration type then Number must be less than or equal
		// to the number of generic parameters of the enclosing class.
		// Rationale: generic enumeration types serve little purpose and usually only exist to meet CLR Rule 42.
		// These additional restrictions limit the genericty of enumeration types while allowing CLS Rule 42 to be met.
		owner: any;

		// This is purely descriptive and is used only by source language compilers and by Reflection.
		name: string;

		internalReadRow(reader: TableStreamReader): void {
			this.number = reader.readShort();
			this.flags = reader.readShort();
			this.owner = reader.readTypeOrMethodDef();
			this.name = reader.readString();
		}
	}

	// The TableKind.GenericParamConstraint table records the constraints for each generic parameter.
	// Each generic parameter can be constrained to derive from zero or one class.
	// Each generic parameter can be constrained to implement zero or more interfaces.
	// Conceptually, each row in the TableKind.GenericParamConstraint table is 'owned' by a row in the TableKind.GenericParam table.
	// All rows in the TableKind.GenericParamConstraint table for a given Owner shall refer to distinct constraints.
	// Note that if Constraint is a TableKind.TypeRef to System.ValueType,
	// then it means the constraint type shall be System.ValueType, or one of its sub types.
	// However, since System.ValueType itself is a reference type,
	// this particular mechanism does not guarantee that the type is a non-reference type.
	// [ECMA-335 para22.21]
	export class GenericParamConstraint {
		// An index into the TableKind.GenericParam table, specifying to which generic parameter this row refers.
		owner: number;

		// An index into the TableKind.TypeDef, TableKind.TypeRef, or TableKind.TypeSpec tables,
		// specifying from which class this generic parameter is constrained to derive;
		// or which interface this generic parameter is constrained to implement;
		// more precisely, a TypeDefOrRef (ECMA-335 para24.2.6) coded index.
		constraint: any;

		internalReadRow(reader: TableStreamReader): void {
			this.owner = reader.readTableRowIndex(TableKind.GenericParam);
			this.constraint = reader.readTypeDefOrRef();
		}
	}

	// The TabeKind.ImplMap table holds information about unmanaged methods
	// that can be reached from managed code, using PInvoke dispatch.
	// Each row of the TableKind.ImplMap table associates a row in the TableKind.MethodDefinition table
	// (MemberForwarded)
	// with the name of a routine (ImportName) in some unmanaged DLL (ImportScope).
	// [ECMA-335 para22.22]
	export class ImplMap {
		// A 2-byte bitmask of type PInvokeAttributes, ECMA-335 para23.1.8.
		mappingFlags: PInvokeAttributes;

		// An index into the TableKind.Field or TableKind.MethodDefinition table;
		// more precisely, a MemberForwarded (ECMA-335 para24.2.6) coded index.
		// However, it only ever indexes the TableKind.MethodDefinition table, since Field export is not supported.
		memberForwarded: any;

		importName: string;

		// An index into the TableKind.ModuleRef table.
		importScope: number;

		internalReadRow(reader: TableStreamReader): void {
			this.mappingFlags = reader.readShort();
			this.memberForwarded = reader.readMemberForwarded();
			this.importName = reader.readString();
			this.importScope = reader.readTableRowIndex(TableKind.ModuleRef);
		}
	}

	// The TableKind.InterfaceImpl table records the interfaces a type implements explicitly.
	// Conceptually, each row in the TableKind.InterfaceImpl table indicates that Class implements Interface.
	// There should be no duplicates in the TableKind.InterfaceImpl table, based upon non-null Class and Interface values  [WARNING]
	// There can be many rows with the same value for Class (since a class can implement many interfaces).
	// There can be many rows with the same value for Interface (since many classes can implement the same interface).
	// [ECMA-335 para22.23]
	export class InterfaceImpl {
		// An index into the TypeDef table.
		// Shall be non-null [ERROR]
		// If Class is non-null, then:
		// a. Class shall index a valid row in the TableKind.TypeDef table  [ERROR]
		// b. Interface shall index a valid row in the TabeKind.TypeDef. or TableKind.TypeRef table [ERROR]
		// c. The row in the TableKind.TypeDef, TabeKind.TypeRef, or TableKind.TypeSpec table
		// indexed by Interface  shall be an interface (Flags.TypeAttributes.Interface = 1), not a TypeAttributes.Class or TypeAttributes.ValueType  [ERROR]
		classIndex: number;

		interface: any;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.interface = reader.readTypeDefOrRef();
		}
	}

	// [ECMA-335 para22.24]
	// The rows in the table result from .mresource directives on the Assembly (ECMA-335 para6.2.2).
	export class ManifestResource {
		// A 4-byte constant.
		// The offset specifies the byte offset within the referenced file at which this resource record begins.
		// Offset shall be a valid offset into the target file, starting from the Resource entry in the CLI header. [ERROR]
		// If the resource is an index into the TableKind.File table, Offset shall be zero. [ERROR]
		offset: number;

		// A 4-byte bitmask of type ManifestResourceAttributes, ECMA-335 para23.1.9.
		flags: ManifestResourceAttributes;

		name: string;

		// An index into a TableKind.File table, a TableKind.AssemblyRef table, or  null;
		// more precisely, an Implementation (ECMA-335 para24.2.6) coded index.
		// Implementation specifies which file holds this resource.
		// Implementation can be null or non-null (if null, it means the resource is stored in the current file).
		implementation: any;

		internalReadRow(reader: TableStreamReader): void {
			this.offset = reader.readInt();
			this.flags = reader.readInt();
			this.name = reader.readString();
			this.implementation = reader.readImplementation();
		}
	}

	// The TableKind.MemberRef table combines two sorts of references, to Methods and to Fields of a class,
	// known as 'MethodRef' and 'FieldRef', respectively.
	// [ECMA-335 para22.25]
	export class MemberRef {
		// An index into the TabeKind.MethodDef, TableKind.ModuleRef,
		// TableKind.TypeDef, TableKind.TypeRef, or TableKind.TypeSpec tables;
		// more precisely, a MemberRefParent (ECMA-335 para24.2.6) coded index.
		// An entry is made into the TableKind.MemberRef table
		// whenever a reference is made in the CIL code to a method or field
		// which is defined in another module or assembly.
		// (Also, an entry is made for a call to a method with a VARARG signature, even when it is defined in the same module as the call site.)
		classIndex: any;

		name: string;

		signature: MethodSignature;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readMemberRefParent();
			this.name = reader.readString();
			this.signature = reader.readMemberSignature();
		}
	}

	export class MetadataStreams {

		guids: string[] = [];
		strings: io.AddressRange = null;
		blobs: io.AddressRange = null;
		tables: io.AddressRange = null;

		read(metadataBaseAddress: number, streamCount: number, reader: io.BufferReader) {

			var guidRange: io.AddressRange;

			for (var i = 0; i < streamCount; i++) {
				var range = new io.AddressRange(
					reader.readInt(),
					reader.readInt());

				range.address += metadataBaseAddress;

				var name = this.readAlignedNameString(reader);


				switch (name) {
					case "#GUID":
						guidRange = range;
						continue;

					case "#Strings":
						this.strings = range;
						continue;

					case "#Blob":
						this.blobs = range;
						continue;

					case "#~":
					case "#-":
						this.tables = range;
						continue;
				}

				(<any>this)[name] = range;
			}

			if (guidRange) {
				var saveOffset = reader.offset;
				reader.setVirtualOffset(guidRange.address);

				this.guids = Array(guidRange.size / 16);
				for (var i = 0; i < this.guids.length; i++) {
					var guid = this.readGuidForStream(reader);
					this.guids[i] = guid;
				}

				reader.offset = saveOffset;
			}
		}

		private readAlignedNameString(reader: io.BufferReader) {
			var result = "";
			while (true) {
				var b = reader.readByte();
				if (b == 0)
					break;

				result += String.fromCharCode(b);
			}

			var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
			for (var i = 0; i < skipCount; i++) {
				reader.readByte();
			}

			return result;
		}

		private readGuidForStream(reader: io.BufferReader) {
			var guid = "{";
			for (var i = 0; i < 4; i++) {
				var hex = reader.readInt().toString(16);
				guid +=
					"00000000".substring(0, 8 - hex.length) + hex;
			}
			guid += "}";
			return guid;
		}
	}

	// TableKind.MethodImpl tables let a compiler override the default inheritance rules provided by the CLI
	// [ECMA-335 para22.27]
	export class MethodImpl {
		// An index into the TableKind.TypeDef table.
		// ILAsm uses the .override directive to specify the rows of the TableKind.MethodImpl table (ECMA-335 para10.3.2 and ECMA-335 para15.4.1).
		classIndex: number;

		// An index into the MethodDef or MemberRef table;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		// The method indexed by MethodBody shall be virtual. [ERROR]
		// The method indexed by MethodBody shall have its Method.RVA != 0
		// (cannot be an unmanaged method reached via PInvoke, for example). [ERROR]
		methodBody: any;

		// An index into the TableKind.MethodDefinition or TableKind.MemberRef table;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		// The method indexed by MethodDeclaration shall have Flags.Virtual set. [ERROR]
		methodDeclaration: any;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.methodBody = reader.readMethodDefOrRef();
			this.methodDeclaration = reader.readMethodDefOrRef();
		}
	}

	// [ECMA-335 para22.28]
	// The rows of the TableKind.MethodSemantics table are filled
	// by .property (ECMA-335 para17) and .event directives (ECMA-335 para18). (See ECMA-335 para22.13 for more information.)
	// If this row is for an Event, and its Semantics is
	// MethodSemanticsAttributes.Addon
	// or MethodSemanticsAttributes.RemoveOn,
	// then the row in the TableKind.MethodDefinition table indexed by Method
	// shall take a Delegate as a parameter, and return void. [ERROR]
	// If this row is for an Event, and its Semantics is
	// MethodSemanticsAttributes.Fire,
	// then the row indexed in the TableKind.MethodDefinition table by Method
	// can return any type.
	export class MethodSemantics {
		// A 2-byte bitmask of type MethodSemanticsAttributes, ECMA-335 para23.1.12.
		// If this row is for a Property, then exactly one of
		// MethodSemanticsAttributes.Setter,
		// MethodSemanticsAttributes.Getter,
		// or MethodSemanticsAttributes.Other shall be set. [ERROR]
		// If this row is for an Event, then exactly one of
		// MethodSemanticsAttributes.AddOn,
		// MethodSemanticsAttributes.RemoveOn,
		// MethodSemanticsAttributes.Fire,
		// or MethodSemanticsAttributes.Other shall be set. [ERROR]
		semantics: MethodSemanticsAttributes;

		// An index into the TableKind.MethodDefinition table.
		// Method shall index a valid row in the TableKind.MethodDefinition table,
		// and that row shall be for a method defined on the same class as the Property or Event this row describes. [ERROR]
		method: number;

		// An index into the TableKind.Event or TableKind.Property table;
		// more precisely, a HasSemantics (ECMA-335 para24.2.6) coded index.
		association: any;

		internalReadRow(reader: TableStreamReader): void {
			this.semantics = reader.readShort();
			this.method = reader.readTableRowIndex(TableKind.MethodDefinition);
			this.association = reader.readHasSemantics();
		}
	}

	// One or more rows can refer to the same row in the TableKind.MethodDefinition or TableKind.MemberRef table.
	// (There can be multiple instantiations of the same generic method.)
	// [ECMA-335 para22.29]
	export class MethodSpec {
		// An index into the TableKind.MethodDefinition or TableKind.MemberRef table,
		// specifying to which generic method this row refers;
		// that is, which generic method this row is an instantiation of;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		method: any;

		instantiation: TypeReference[] = [];

		internalReadRow(reader: TableStreamReader): void {
			this.method = reader.readMethodDefOrRef();
			reader.readMethodSpec(this.instantiation);
		}
	}

	export class MethodSpecSig {
		constructor(public blob: any) {
		}
	}

	// The rows in the TableKind.ModuleRef table result from .module extern directives in the Assembly (ECMA-335 para6.5).
	// [ECMA-335 para22.31]
	export class ModuleRef {
		name: string;

		internalReadRow(reader: TableStreamReader): void {
			this.name = reader.readString();
		}
	}

	// [ECMA-335 para22.32]
	export class NestedClass {
		// An index into the TableKind.TypeDef table.
		nestedClass: number;

		// An index into the TableKind.TypeDef table.
		enclosingClass: number;

		internalReadRow(reader: TableStreamReader): void {
			this.nestedClass = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.enclosingClass = reader.readTableRowIndex(TableKind.TypeDefinition);
		}
	}

	// The TableKind.PropertyMap and TableKind.Property tables result from putting the .property directive on a class (ECMA-335 para17).
	// [ECMA-335 para22.35]
	export class PropertyMap {
		// An index into the TableKind.TypeDef table.
		parent: number;

		// An index into the TableKind.Property table.
		// It marks the first of a contiguous run of Properties owned by Parent.
		propertyList: number;

		internalReadRow(reader: TableStreamReader): void {
			this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.propertyList = reader.readTableRowIndex(TableKind.PropertyDefinition);
		}
	}

	// Signatures are stored in the metadata Blob heap.
	// In most cases, they are indexed by a column in some table --
	// FieldEntry.Signature, Method.Signature, MemberRef.Signature, etc.
	// However, there are two cases that require a metadata token for a signature
	// that is not indexed by any metadata table.
	// The TableKind.StandAloneSig table fulfils this need.
	// It has just one column, which points to a Signature in the Blob heap.
	// The signature shall describe either:
	// * a method � code generators create a row in the TableKind.StandAloneSig table for each occurrence of a calli CIL instruction.
	// That row indexes the call-site signature for the function pointer operand of the calli instruction.
	// * local variables � code generators create one row in the TableKind.StandAloneSig table for each method,
	// to describe all of its local variables.
	// The .locals directive (ECMA-335 para15.4.1) in ILAsm generates a row in the TableKind.StandAloneSig table.
	// [ECMA-335 para22.36]
	export class StandAloneSig {
		// The signature 'blob' indexed by Signature shall be a valid METHOD or LOCALS signature. [ERROR]
		// Duplicate rows are allowed.
		signatureBlob: any;

		internalReadRow(reader: TableStreamReader): void {
			this.signatureBlob = reader.readBlob();
		}
	}

	// The TableKind.TypeSpec table has just one column,
	// which indexes the specification of a Type, stored in the Blob heap.
	// This provides a metadata token for that Type (rather than simply an index into the Blob heap).
	// This is required, typically, for array operations, such as creating, or calling methods on the array class.
	// [ECMA-335 para22.39]
	// Note that TypeSpec tokens can be used with any of the CIL instructions
	// that take a TypeDef or TypeRef token;
	// specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.
	export class TypeSpec {
		definition: TypeReference;

		internalReadRow(reader: TableStreamReader): void {
			this.definition = <any>reader.readBlob();
		}
	}
}