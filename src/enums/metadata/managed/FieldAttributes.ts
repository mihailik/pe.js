module pe.managed.metadata {

  /**
   * [ECMA-335 para23.1.5]
   */
  export enum FieldAttributes {

    /**
     * These 3 bits contain one of the following values:
     * CompilerControlled, Private,
     * FamANDAssem, Assembly,
     * Family, FamORAssem,
     * Public.
     */
    FieldAccessMask = 0x0007,

    /***
     * Member not referenceable.
     */
    CompilerControlled = 0x0000,

    /**
     * Accessible only by the parent type.
     */
    Private = 0x0001,

    /**
     * Accessible by sub-types only in this Assembly.
     */
    FamANDAssem = 0x0002,

    /**
     * Accessibly by anyone in the Assembly.
     */
    Assembly = 0x0003,

    /**
     * Accessible only by type and sub-types.
     */
    Family = 0x0004,

    /**
     * Accessibly by sub-types anywhere, plus anyone in assembly.
     */
    FamORAssem = 0x0005,

    /**
     * Accessibly by anyone who has visibility to this scope field contract attributes.
     */
    Public = 0x0006,


    /**
     * Defined on type, else per instance.
     */
    Static = 0x0010,

    /**
     * Field can only be initialized, not written to after init.
     */
    InitOnly = 0x0020,

    /**
     * Value is compile time constant.
     */
    Literal = 0x0040,

    /**
     * Reserved (to indicate this field should not be serialized when type is remoted).
     */
    NotSerialized = 0x0080,

    /**
     * Field is special.
     */
    SpecialName = 0x0200,


    /**
     * Interop Attributes
     */

    /**
     * Implementation is forwarded through PInvoke.
     */
    PInvokeImpl = 0x2000,


    /**
     * Additional flags
     */

    /**
     * CLI provides 'special' behavior, depending upon the name of the field.
     */
    RTSpecialName = 0x0400,

    /**
     * Field has marshalling information.
     */
    HasFieldMarshal = 0x1000,

    /**
     * Field has default.
     */
    HasDefault = 0x8000,

    /**
     * Field has RVA.
     */
    HasFieldRVA = 0x0100
  }

}