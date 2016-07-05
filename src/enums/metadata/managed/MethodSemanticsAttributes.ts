module pe.managed.metadata {

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

}