module pe.managed.metadata {

  // [ECMA-335 para23.1.9]
	export enum ManifestResourceAttributes {

		// These 3 bits contain one of the following values:
		VisibilityMask = 0x0007,

		// The Resource is exported from the Assembly.
		Public = 0x0001,

		// The Resource is private to the Assembly.
		Private = 0x0002
	}

}