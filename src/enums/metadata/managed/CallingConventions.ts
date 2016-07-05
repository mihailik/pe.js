module pe.managed.metadata {

  /**
   * [ECMA-335 para23.2.3]
   */
  export enum CallingConventions {

    /**
     * Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
     */
    Default = 0x0,

    C = 0x1,

    StdCall = 0x2,

    FastCall = 0x4,

    /**
     * Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
     */
    VarArg = 0x5,

    /**
     * Used to indicate that the method has one or more generic parameters.
     */
    Generic = 0x10,

    /**
     * Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
     */
    HasThis = 0x20,

    /**
     * Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
     */
    ExplicitThis = 0x40,

    /**
     * (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
     */
    Sentinel = 0x41,
  }

}