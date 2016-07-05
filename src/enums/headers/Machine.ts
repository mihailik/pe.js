module pe.headers {

  export enum Machine {
    /**
     * The target CPU is unknown or not specified.
     */
    Unknown = 0x0000,

    /**
     * Intel 386.
     */
    I386 = 0x014C,

    /**
     * MIPS little-endian
     */
    R3000 = 0x0162,

    /**
     * MIPS little-endian
     */
    R4000 = 0x0166,

    /**
     * MIPS little-endian
     */
    R10000 = 0x0168,

    /**
     * MIPS little-endian WCE v2
     */
    WCEMIPSV2 = 0x0169,

    /**
     * Alpha_AXP
     */
    Alpha = 0x0184,

    /**
     * SH3 little-endian
     */
    SH3 = 0x01a2,

    /**
     * SH3 little-endian. DSP.
     */
    SH3DSP = 0x01a3,

    /**
     * SH3E little-endian.
     */
    SH3E = 0x01a4,

    /**
     * SH4 little-endian.
     */
    SH4 = 0x01a6,

    /**
     * SH5.
     */
    SH5 = 0x01a8,

    /**
     * ARM Little-Endian
     */
    ARM = 0x01c0,

    /**
     * Thumb.
     */
    Thumb = 0x01c2,

    /**
     * AM33
     */
    AM33 = 0x01d3,

    /**
     * IBM PowerPC Little-Endian
     */
    PowerPC = 0x01F0,

    /**
     * PowerPCFP
     */
    PowerPCFP = 0x01f1,

    /**
     * Intel 64
     */
    IA64 = 0x0200,

    /**
     * MIPS
     */
    MIPS16 = 0x0266,

    /**
     * ALPHA64
     */
    Alpha64 = 0x0284,

    /**
     * MIPS
     */
    MIPSFPU = 0x0366,

    /**
     * MIPS
     */
    MIPSFPU16 = 0x0466,

    /**
     * AXP64
     */
    AXP64 = Alpha64,

    /**
     * Infineon
     */
    Tricore = 0x0520,

    /**
     * CEF
     */
    CEF = 0x0CEF,

    /**
     * EFI Byte Code
     */
    EBC = 0x0EBC,

    /**
     * AMD64 (K8)
     */
    AMD64 = 0x8664,

    /**
     * M32R little-endian
     */
    M32R = 0x9041,

    /**
     * CEE
     */
    CEE = 0xC0EE,
  }
}