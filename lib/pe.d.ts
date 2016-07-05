declare module pe {
    /**
     * 64-bit integer
     */
    class Long {
        lo: number;
        hi: number;
        constructor(lo: number, hi: number);
        toString(): string;
    }
}
declare module pe {
    /**
     * Used for optional cooperative multitasking.
     */
    interface AsyncCallback<T> {
        (error: Error, result: T): any;
        progress?: AsyncCallback.ProgressCallback;
    }
    module AsyncCallback {
        interface ProgressCallback {
            (value: number, total: number, text?: string): YieldCallback;
        }
        interface YieldCallback {
            (next: () => void): any;
        }
    }
}
declare module pe {
    /**
     * Convert enum value to string, considering the bit flags.
     */
    function formatEnum(value: any, type: any): string;
    function bytesToHex(bytes: Uint8Array): string;
}
declare module pe.headers {
    enum DataDirectoryKind {
        ExportSymbols = 0,
        ImportSymbols = 1,
        Resources = 2,
        Exception = 3,
        Security = 4,
        BaseRelocation = 5,
        Debug = 6,
        CopyrightString = 7,
        Unknown = 8,
        ThreadLocalStorage = 9,
        LoadConfiguration = 10,
        BoundImport = 11,
        ImportAddressTable = 12,
        DelayImport = 13,
        /**
         * Common Language Runtime, look for ClrDirectory at that offset.
         */
        Clr = 14,
    }
}
declare module pe.headers {
    enum DllCharacteristics {
        /**
         * Reserved.
         */
        ProcessInit = 1,
        /**
         * Reserved.
         */
        ProcessTerm = 2,
        /**
         * Reserved.
         */
        ThreadInit = 4,
        /**
         * Reserved.
         */
        ThreadTerm = 8,
        /**
         * The DLL can be relocated at load time.
         */
        DynamicBase = 64,
        /**
         * Code integrity checks are forced.
         * If you set this flag and a section contains only uninitialized data,
         * set the PointerToRawData member of IMAGE_SECTION_HEADER
         * for that section to zero;
         * otherwise, the image will fail to load because the digital signature cannot be verified.
         */
        ForceIntegrity = 128,
        /**
         * The image is compatible with data execution prevention (DEP).
         */
        NxCompatible = 256,
        /**
         * The image is isolation aware, but should not be isolated.
         */
        NoIsolation = 512,
        /**
         * The image does not use structured exception handling (SEH). No SE handler may reside in this image.
         */
        NoSEH = 1024,
        /**
         * Do not bind this image.
         */
        NoBind = 2048,
        /**
         * The image must run inside an AppContainer.
         */
        AppContainer = 4096,
        /**
         * WDM (Windows Driver Model) driver.
         */
        WdmDriver = 8192,
        /**
         * Reserved (no specific name).
         */
        Reserved = 16384,
        /**
         * The image is terminal server aware.
         */
        TerminalServerAware = 32768,
    }
}
declare module pe.headers {
    enum ImageCharacteristics {
        /**
         * Relocation information was stripped from the file.
         * The file must be loaded at its preferred base address.
         * If the base address is not available, the loader reports an error.
         */
        RelocsStripped = 1,
        /**
         * The file is executable (there are no unresolved external references).
         */
        ExecutableImage = 2,
        /**
         * COFF line numbers were stripped from the file.
         */
        LineNumsStripped = 4,
        /**
         * COFF symbol table entries were stripped from file.
         */
        LocalSymsStripped = 8,
        /**
         * Aggressively trim the working set.
         * This value is obsolete as of Windows 2000.
         */
        AggressiveWsTrim = 16,
        /**
         * The application can handle addresses larger than 2 GB.
         */
        LargeAddressAware = 32,
        /**
         * The bytes of the word are reversed. This flag is obsolete.
         */
        BytesReversedLo = 128,
        /**
         * The computer supports 32-bit words.
         */
        Bit32Machine = 256,
        /**
         * Debugging information was removed and stored separately in another file.
         */
        DebugStripped = 512,
        /**
         * If the image is on removable media, copy it to and run it from the swap file.
         */
        RemovableRunFromSwap = 1024,
        /**
         * If the image is on the network, copy it to and run it from the swap file.
         */
        NetRunFromSwap = 2048,
        /**
         * The image is a system file.
         */
        System = 4096,
        /**
         * The image is a DLL file.
         * While it is an executable file, it cannot be run directly.
         */
        Dll = 8192,
        /**
         * The file should be run only on a uniprocessor computer.
         */
        UpSystemOnly = 16384,
        /**
         * The bytes of the word are reversed. This flag is obsolete.
         */
        BytesReversedHi = 32768,
    }
}
declare module pe.headers {
    enum MZSignature {
        MZ,
    }
}
declare module pe.headers {
    enum Machine {
        /**
         * The target CPU is unknown or not specified.
         */
        Unknown = 0,
        /**
         * Intel 386.
         */
        I386 = 332,
        /**
         * MIPS little-endian
         */
        R3000 = 354,
        /**
         * MIPS little-endian
         */
        R4000 = 358,
        /**
         * MIPS little-endian
         */
        R10000 = 360,
        /**
         * MIPS little-endian WCE v2
         */
        WCEMIPSV2 = 361,
        /**
         * Alpha_AXP
         */
        Alpha = 388,
        /**
         * SH3 little-endian
         */
        SH3 = 418,
        /**
         * SH3 little-endian. DSP.
         */
        SH3DSP = 419,
        /**
         * SH3E little-endian.
         */
        SH3E = 420,
        /**
         * SH4 little-endian.
         */
        SH4 = 422,
        /**
         * SH5.
         */
        SH5 = 424,
        /**
         * ARM Little-Endian
         */
        ARM = 448,
        /**
         * Thumb.
         */
        Thumb = 450,
        /**
         * AM33
         */
        AM33 = 467,
        /**
         * IBM PowerPC Little-Endian
         */
        PowerPC = 496,
        /**
         * PowerPCFP
         */
        PowerPCFP = 497,
        /**
         * Intel 64
         */
        IA64 = 512,
        /**
         * MIPS
         */
        MIPS16 = 614,
        /**
         * ALPHA64
         */
        Alpha64 = 644,
        /**
         * MIPS
         */
        MIPSFPU = 870,
        /**
         * MIPS
         */
        MIPSFPU16 = 1126,
        /**
         * AXP64
         */
        AXP64 = 644,
        /**
         * Infineon
         */
        Tricore = 1312,
        /**
         * CEF
         */
        CEF = 3311,
        /**
         * EFI Byte Code
         */
        EBC = 3772,
        /**
         * AMD64 (K8)
         */
        AMD64 = 34404,
        /**
         * M32R little-endian
         */
        M32R = 36929,
        /**
         * CEE
         */
        CEE = 49390,
    }
}
declare module pe.headers {
    enum PEMagic {
        NT32 = 267,
        NT64 = 523,
        ROM = 263,
    }
}
declare module pe.headers {
    enum PESignature {
        PE,
    }
}
declare module pe.headers {
    enum SectionCharacteristics {
        Reserved_0h = 0,
        Reserved_1h = 1,
        Reserved_2h = 2,
        Reserved_4h = 4,
        /**
         * The section should not be padded to the next boundary.
         * This flag is obsolete and is replaced by Align1Bytes.
         */
        NoPadding = 8,
        Reserved_10h = 16,
        /**
         * The section contains executable code.
         */
        ContainsCode = 32,
        /**
         * The section contains initialized data.
         */
        ContainsInitializedData = 64,
        /**
         * The section contains uninitialized data.
         */
        ContainsUninitializedData = 128,
        /**
         * Reserved.
         */
        LinkerOther = 256,
        /**
         * The section contains comments or other information.
         * This is valid only for object files.
         */
        LinkerInfo = 512,
        Reserved_400h = 1024,
        /**
         * The section will not become part of the image.
         * This is valid only for object files.
         */
        LinkerRemove = 2048,
        /**
         * The section contains COMDAT data.
         * This is valid only for object files.
         */
        LinkerCOMDAT = 4096,
        Reserved_2000h = 8192,
        /**
         * Reset speculative exceptions handling bits in the TLB entries for this section.
         */
        NoDeferredSpeculativeExecution = 16384,
        /**
         * The section contains data referenced through the global pointer.
         */
        GlobalPointerRelative = 32768,
        Reserved_10000h = 65536,
        /**
         * Reserved.
         */
        MemoryPurgeable = 131072,
        /**
         * Reserved.
         */
        MemoryLocked = 262144,
        /**
         * Reserved.
         */
        MemoryPreload = 524288,
        /**
         * Align data on a 1-byte boundary.
         * This is valid only for object files.
         */
        Align1Bytes = 1048576,
        /**
         * Align data on a 2-byte boundary.
         * This is valid only for object files.
         */
        Align2Bytes = 2097152,
        /**
         * Align data on a 4-byte boundary.
         * This is valid only for object files.
         */
        Align4Bytes = 3145728,
        /**
         * Align data on a 8-byte boundary.
         * This is valid only for object files.
         */
        Align8Bytes = 4194304,
        /**
         * Align data on a 16-byte boundary.
         * This is valid only for object files.
         */
        Align16Bytes = 5242880,
        /**
         * Align data on a 32-byte boundary.
         * This is valid only for object files.
         */
        Align32Bytes = 6291456,
        /**
         * Align data on a 64-byte boundary.
         * This is valid only for object files.
         */
        Align64Bytes = 7340032,
        /**
         * Align data on a 128-byte boundary.
         * This is valid only for object files.
         */
        Align128Bytes = 8388608,
        /**
         * Align data on a 256-byte boundary.
         * This is valid only for object files.
         */
        Align256Bytes = 9437184,
        /**
         * Align data on a 512-byte boundary.
         * This is valid only for object files.
         */
        Align512Bytes = 10485760,
        /**
         * Align data on a 1024-byte boundary.
         * This is valid only for object files.
         */
        Align1024Bytes = 11534336,
        /**
         * Align data on a 2048-byte boundary.
         * This is valid only for object files.
         */
        Align2048Bytes = 12582912,
        /**
         * Align data on a 4096-byte boundary.
         * This is valid only for object files.
         */
        Align4096Bytes = 13631488,
        /**
         * Align data on a 8192-byte boundary.
         * This is valid only for object files.
         */
        Align8192Bytes = 14680064,
        /**
         * The section contains extended relocations.
         * The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
         * If the NumberOfRelocations field in the section header is 0xffff,
         * the actual relocation count is stored in the VirtualAddress field of the first relocation.
         * It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
         */
        LinkerRelocationOverflow = 16777216,
        /**
         * The section can be discarded as needed.
         */
        MemoryDiscardable = 33554432,
        /**
         * The section cannot be cached.
         */
        MemoryNotCached = 67108864,
        /**
         * The section cannot be paged.
         */
        MemoryNotPaged = 134217728,
        /**
         * The section can be shared in memory.
         */
        MemoryShared = 268435456,
        /**
         * The section can be executed as code.
         */
        MemoryExecute = 536870912,
        /**
         * The section can be read.
         */
        MemoryRead = 1073741824,
        /**
         * The section can be written to.
         */
        MemoryWrite = 2147483648,
    }
}
declare module pe.headers {
    enum Subsystem {
        /**
         * Unknown subsystem.
         */
        Unknown = 0,
        /**
         * No subsystem required (device drivers and native system processes).
         */
        Native = 1,
        /**
         * Windows graphical user interface (GUI) subsystem.
         */
        WindowsGUI = 2,
        /**
         * Windows character-mode user interface (CUI) subsystem.
         */
        WindowsCUI = 3,
        /**
         * OS/2 console subsystem.
         */
        OS2CUI = 5,
        /**
         * POSIX console subsystem.
         */
        POSIXCUI = 7,
        /**
         * Image is a native Win9x driver.
         */
        NativeWindows = 8,
        /**
         * Windows CE system.
         */
        WindowsCEGUI = 9,
        /**
         * Extensible Firmware Interface (EFI) application.
         */
        EFIApplication = 10,
        /**
         * EFI driver with boot services.
         */
        EFIBootServiceDriver = 11,
        /**
         * EFI driver with run-time services.
         */
        EFIRuntimeDriver = 12,
        /**
         * EFI ROM image.
         */
        EFIROM = 13,
        /**
         * Xbox system.
         */
        XBOX = 14,
        /**
         * Boot application.
         */
        BootApplication = 16,
    }
}
declare module pe.managed.metadata {
    enum AssemblyFlags {
        /**
         * The assembly reference holds the full (unhashed) public key.
         */
        PublicKey = 1,
        /**
         * The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
         * (See the text following this table.)
         */
        Retargetable = 256,
        /**
         * Reserved
         * (a conforming implementation of the CLI can ignore this setting on read;
         * some implementations might use this bit to indicate
         * that a CIL-to-native-code compiler should not generate optimized code).
         */
        DisableJITcompileOptimizer = 16384,
        /**
         * Reserved
         * (a conforming implementation of the CLI can ignore this setting on read;
         * some implementations might use this bit to indicate
         * that a CIL-to-native-code compiler should generate CIL-to-native code map).
         */
        EnableJITcompileTracking = 32768,
    }
}
declare module pe.managed.metadata {
    enum AssemblyHashAlgorithm {
        None = 0,
        MD5 = 32771,
        SHA1 = 32772,
        SHA256 = 32780,
        SHA384 = 32781,
        SHA512 = 32782,
    }
}
declare module pe.managed.metadata {
    /**
     * [ECMA-335 para23.2.3]
     */
    enum CallingConventions {
        /**
         * Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
         */
        Default = 0,
        C = 1,
        StdCall = 2,
        FastCall = 4,
        /**
         * Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
         */
        VarArg = 5,
        /**
         * Used to indicate that the method has one or more generic parameters.
         */
        Generic = 16,
        /**
         * Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
         */
        HasThis = 32,
        /**
         * Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
         */
        ExplicitThis = 64,
        /**
         * (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
         */
        Sentinel = 65,
    }
}
declare module pe.managed.metadata {
    enum ClrImageFlags {
        ILOnly = 1,
        _32BitRequired = 2,
        ILLibrary = 4,
        StrongNameSigned = 8,
        NativeEntryPoint = 16,
        TrackDebugData = 65536,
        IsIbcoptimized = 131072,
    }
}
declare module pe.managed.metadata {
    enum ClrMetadataSignature {
        Signature = 1112167234,
    }
}
declare module pe.managed.metadata {
    /**
     * [ECMA-335 para23.1.16]
     */
    enum ElementType {
        /**
         * Marks end of a list.
         */
        End = 0,
        Void = 1,
        Boolean = 2,
        Char = 3,
        I1 = 4,
        U1 = 5,
        I2 = 6,
        U2 = 7,
        I4 = 8,
        U4 = 9,
        I8 = 10,
        U8 = 11,
        R4 = 12,
        R8 = 13,
        String = 14,
        /**
         * Followed by type.
         */
        Ptr = 15,
        /**
         * Followed by type.
         */
        ByRef = 16,
        /**
         * Followed by TypeDef or TypeRef token.
         */
        ValueType = 17,
        /**
         * Followed by TypeDef or TypeRef token.
         */
        Class = 18,
        /**
         * Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
         */
        Var = 19,
        /**
         * type rank boundsCount bound1 loCount lo1
         */
        Array = 20,
        /**
         * Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
         */
        GenericInst = 21,
        TypedByRef = 22,
        /**
         * System.IntPtr
         */
        I = 24,
        /**
         * System.UIntPtr
         */
        U = 25,
        /**
         * Followed by full method signature.
         */
        FnPtr = 27,
        /**
         * System.Object
         */
        Object = 28,
        /**
         * Single-dim array with 0 lower bound
         */
        SZArray = 29,
        /**
         * Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
         */
        MVar = 30,
        /**
         * Required modifier: followed by TypeDef or TypeRef token.
         */
        CMod_ReqD = 31,
        /**
         * Optional modifier: followed by TypeDef or TypeRef token.
         */
        CMod_Opt = 32,
        /**
         * Implemented within the CLI.
         */
        Internal = 33,
        /**
         * Or'd with following element types.
         */
        Modifier = 64,
        /**
         * Sentinel for vararg method signature.
         */
        Sentinel = 65,
        /**
         * Denotes a local variable that points at a pinned object,
         */
        Pinned = 69,
        R4_Hfa = 70,
        R8_Hfa = 71,
        /**
         * Indicates an argument of type System.Type.
         */
        ArgumentType_ = 80,
        /**
         * Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
         */
        CustomAttribute_BoxedObject_ = 81,
        /**
         * Reserved_ = 0x12 | Modifier,
         */
        /**
         * Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
         */
        CustomAttribute_Field_ = 83,
        /**
         * Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
         */
        CustomAttribute_Property_ = 84,
        /**
         * Used in custom attributes to specify an enum (ECMA-335 para23.3).
         */
        CustomAttribute_Enum_ = 85,
    }
}
declare module pe.managed.metadata {
    /**
     * [ECMA-335 para23.1.4]
     */
    enum EventAttributes {
        /**
         * Event is special.
         */
        SpecialName = 512,
        /**
         * CLI provides 'special' behavior, depending upon the name of the event.
         */
        RTSpecialName = 1024,
    }
}
declare module pe.managed.metadata {
    /**
     * [ECMA-335 para23.1.5]
     */
    enum FieldAttributes {
        /**
         * These 3 bits contain one of the following values:
         * CompilerControlled, Private,
         * FamANDAssem, Assembly,
         * Family, FamORAssem,
         * Public.
         */
        FieldAccessMask = 7,
        /***
         * Member not referenceable.
         */
        CompilerControlled = 0,
        /**
         * Accessible only by the parent type.
         */
        Private = 1,
        /**
         * Accessible by sub-types only in this Assembly.
         */
        FamANDAssem = 2,
        /**
         * Accessibly by anyone in the Assembly.
         */
        Assembly = 3,
        /**
         * Accessible only by type and sub-types.
         */
        Family = 4,
        /**
         * Accessibly by sub-types anywhere, plus anyone in assembly.
         */
        FamORAssem = 5,
        /**
         * Accessibly by anyone who has visibility to this scope field contract attributes.
         */
        Public = 6,
        /**
         * Defined on type, else per instance.
         */
        Static = 16,
        /**
         * Field can only be initialized, not written to after init.
         */
        InitOnly = 32,
        /**
         * Value is compile time constant.
         */
        Literal = 64,
        /**
         * Reserved (to indicate this field should not be serialized when type is remoted).
         */
        NotSerialized = 128,
        /**
         * Field is special.
         */
        SpecialName = 512,
        /**
         * Interop Attributes
         */
        /**
         * Implementation is forwarded through PInvoke.
         */
        PInvokeImpl = 8192,
        /**
         * Additional flags
         */
        /**
         * CLI provides 'special' behavior, depending upon the name of the field.
         */
        RTSpecialName = 1024,
        /**
         * Field has marshalling information.
         */
        HasFieldMarshal = 4096,
        /**
         * Field has default.
         */
        HasDefault = 32768,
        /**
         * Field has RVA.
         */
        HasFieldRVA = 256,
    }
}
declare module pe.managed.metadata {
    /**
     * [ECMA-335 para23.1.6]
     */
    enum FileAttributes {
        /**
         * This is not a resource file.
         */
        ContainsMetaData = 0,
        /**
         * This is a resource file or other non-metadata-containing file.
         */
        ContainsNoMetaData = 1,
    }
}
declare module pe.managed.metadata {
    enum ManifestResourceAttributes {
        VisibilityMask = 7,
        Public = 1,
        Private = 2,
    }
}
declare module pe.managed.metadata {
    /** [ECMA-335 para23.1.10] */
    enum MethodAttributes {
        MemberAccessMask = 7,
        CompilerControlled = 0,
        Private = 1,
        FamANDAssem = 2,
        Assem = 3,
        Family = 4,
        FamORAssem = 5,
        Public = 6,
        Static = 16,
        Final = 32,
        Virtual = 64,
        HideBySig = 128,
        VtableLayoutMask = 256,
        ReuseSlot = 0,
        NewSlot = 256,
        Strict = 512,
        Abstract = 1024,
        SpecialName = 2048,
        PInvokeImpl = 8192,
        UnmanagedExport = 8,
        RTSpecialName = 4096,
        HasSecurity = 16384,
        RequireSecObject = 32768,
    }
}
declare module pe.managed.metadata {
    enum MethodImplAttributes {
        CodeTypeMask = 3,
        IL = 0,
        Native = 1,
        OPTIL = 2,
        Runtime = 3,
        ManagedMask = 4,
        Unmanaged = 4,
        Managed = 0,
        ForwardRef = 16,
        PreserveSig = 128,
        InternalCall = 4096,
        Synchronized = 32,
        NoInlining = 8,
        MaxMethodImplVal = 65535,
        NoOptimization = 64,
    }
}
declare module pe.managed.metadata {
    enum MethodSemanticsAttributes {
        Setter = 1,
        Getter = 2,
        Other = 4,
        AddOn = 8,
        RemoveOn = 16,
        Fire = 32,
    }
}
declare module pe.managed.metadata {
    enum PInvokeAttributes {
        NoMangle = 1,
        CharSetMask = 6,
        CharSetNotSpec = 0,
        CharSetAnsi = 2,
        CharSetUnicode = 4,
        CharSetAuto = 6,
        SupportsLastError = 64,
        CallConvMask = 1792,
        CallConvPlatformapi = 256,
        CallConvCdecl = 512,
        CallConvStdcall = 768,
        CallConvThiscall = 1024,
        CallConvFastcall = 1280,
    }
}
declare module pe.managed.metadata {
    enum ParamAttributes {
        In = 1,
        Out = 2,
        Optional = 16,
        HasDefault = 4096,
        HasFieldMarshal = 8192,
        Unused = 53216,
    }
}
declare module pe.managed.metadata {
    enum PropertyAttributes {
        SpecialName = 512,
        RTSpecialName = 1024,
        HasDefault = 4096,
        Unused = 59903,
    }
}
declare module pe.managed.metadata {
    enum TypeAttributes {
        VisibilityMask = 7,
        NotPublic = 0,
        Public = 1,
        NestedPublic = 2,
        NestedPrivate = 3,
        NestedFamily = 4,
        NestedAssembly = 5,
        NestedFamANDAssem = 6,
        NestedFamORAssem = 7,
        LayoutMask = 24,
        AutoLayout = 0,
        SequentialLayout = 8,
        ExplicitLayout = 16,
        ClassSemanticsMask = 32,
        Class = 0,
        Interface = 32,
        Abstract = 128,
        Sealed = 256,
        SpecialName = 1024,
        Import = 4096,
        Serializable = 8192,
        StringFormatMask = 196608,
        AnsiClass = 0,
        UnicodeClass = 65536,
        AutoClass = 131072,
        CustomFormatClass = 196608,
        CustomStringFormatMask = 12582912,
        BeforeFieldInit = 1048576,
        RTSpecialName = 2048,
        HasSecurity = 262144,
        IsTypeForwarder = 2097152,
    }
}
declare module pe.headers {
}
declare module pe.headers {
    class DosHeader {
        static intSize: number;
        mz: MZSignature;
        /**
         * Bytes on last page of file.
         */
        cblp: number;
        /**
         * Pages in file.
         */
        cp: number;
        /**
         * Relocations.
         */
        crlc: number;
        /**
         * Size of header in paragraphs.
         */
        cparhdr: number;
        /**
         * Minimum extra paragraphs needed.
         */
        minalloc: number;
        /**
         * Maximum extra paragraphs needed.
         */
        maxalloc: number;
        /**
         * Initial (relative) SS value.
         */
        ss: number;
        /**
         * Initial SP value.
         */
        sp: number;
        /**
         * Checksum.
         */
        csum: number;
        /**
         * Initial IP value.
         */
        ip: number;
        /**
         * Initial (relative) CS value.
         */
        cs: number;
        /**
         * File address of relocation table.
         */
        lfarlc: number;
        /**
         * Overlay number.
         */
        ovno: number;
        res1: Long;
        /**
         * OEM identifier (for e_oeminfo).
         */
        oemid: number;
        /**
         * OEM information: number; e_oemid specific.
         */
        oeminfo: number;
        reserved: number[];
        /**
         * uint: File address of PE header.
         */
        lfanew: number;
        toString(): string;
        read(reader: io.BufferReader): void;
    }
}
declare module pe.headers {
    class OptionalHeader {
        static intSize32: number;
        static intSize64: number;
        /** Differentiates 32-bit images from 64-bit. */
        peMagic: PEMagic;
        linkerVersion: string;
        /**
         * The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
         */
        sizeOfCode: number;
        /**
         * The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
         */
        sizeOfInitializedData: number;
        /**
         * The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
         */
        sizeOfUninitializedData: number;
        /**
         * A pointer to the entry point function, relative to the image base address.
         * For executable files, this is the starting address.
         * For device drivers, this is the address of the initialization function.
         * The entry point function is optional for DLLs.
         * When no entry point is present, this member is zero.
         */
        addressOfEntryPoint: number;
        /**
         * A pointer to the beginning of the code section, relative to the image base.
         */
        baseOfCode: number;
        /**
         * A pointer to the beginning of the data section, relative to the image base.
         */
        baseOfData: number;
        /**
         * Uint or 64-bit long.
         * The preferred address of the first byte of the image when it is loaded in memory.
         * This value is a multiple of 64K bytes.
         * The default value for DLLs is 0x10000000.
         * The default value for applications is 0x00400000,
         * except on Windows CE where it is 0x00010000.
         */
        imageBase: any;
        /**
         * The alignment of sections loaded in memory, in bytes.
         * This value must be greater than or equal to the FileAlignment member.
         * The default value is the page size for the system.
         */
        sectionAlignment: number;
        /**
         * The alignment of the raw data of sections in the image file, in bytes.
         * The value should be a power of 2 between 512 and 64K (inclusive).
         * The default is 512.
         * If the <see cref="SectionAlignment"/> member is less than the system page size,
         * this member must be the same as <see cref="SectionAlignment"/>.
         */
        fileAlignment: number;
        /**
         * The version of the required operating system.
         */
        operatingSystemVersion: string;
        /**
         * The version of the image.
         */
        imageVersion: string;
        /**
         * The version of the subsystem.
         */
        subsystemVersion: string;
        /**
         * This member is reserved and must be 0.
         */
        win32VersionValue: number;
        /**
         * The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
         */
        sizeOfImage: number;
        /**
         * The combined size of the MS-DOS stub, the PE header, and the section headers,
         * rounded to a multiple of the value specified in the FileAlignment member.
         */
        sizeOfHeaders: number;
        /**
         * The image file checksum.
         * The following files are validated at load time:
         * all drivers,
         * any DLL loaded at boot time,
         * and any DLL loaded into a critical system process.
         */
        checkSum: number;
        /**
         * The subsystem required to run this image.
         */
        subsystem: Subsystem;
        /**
         * The DLL characteristics of the image.
         */
        dllCharacteristics: DllCharacteristics;
        /**
         * Uint or 64 bit long.
         * The number of bytes to reserve for the stack.
         * Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
         * the rest is made available one page at a time until this reserve size is reached.
         */
        sizeOfStackReserve: any;
        /**
         * Uint or 64 bit long.
         * The number of bytes to commit for the stack.
         */
        sizeOfStackCommit: any;
        /**
         * Uint or 64 bit long.
         * The number of bytes to reserve for the local heap.
         * Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
         * the rest is made available one page at a time until this reserve size is reached.
         */
        sizeOfHeapReserve: any;
        /**
         * Uint or 64 bit long.
         * The number of bytes to commit for the local heap.
         */
        sizeOfHeapCommit: any;
        /**
         * This member is obsolete.
         */
        loaderFlags: number;
        /**
         * The number of directory entries in the remainder of the optional header.
         * Each entry describes a location and size.
         */
        numberOfRvaAndSizes: number;
        dataDirectories: AddressRange[];
        toString(): string;
        read(reader: io.BufferReader): void;
    }
}
declare module pe.headers {
    class PEFileHeaders {
        dosHeader: DosHeader;
        dosStub: Uint8Array;
        peHeader: PEHeader;
        optionalHeader: OptionalHeader;
        sectionHeaders: SectionHeader[];
        toString(): string;
        read(reader: io.BufferReader, async?: AsyncCallback<PEFileHeaders>): void;
        private _continueRead(reader, async, stage);
    }
}
declare module pe.headers {
    class PEHeader {
        static intSize: number;
        pe: PESignature;
        /**
         * The architecture type of the computer.
         * An image file can only be run on the specified computer or a system that emulates the specified computer.
         */
        machine: Machine;
        /**
         * UShort. Indicates the size of the section table, which immediately follows the headers.
         * Note that the Windows loader limits the number of sections to 96.
         */
        numberOfSections: number;
        /**
         * The low 32 bits of the time stamp of the image.
         * This represents the date and time the image was created by the linker.
         * The value is represented in the number of seconds elapsed since
         * midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
         * according to the system clock.
         */
        timestamp: Date;
        /**
         * UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
         */
        pointerToSymbolTable: number;
        /**
         * UInt. The number of symbols in the symbol table.
         */
        numberOfSymbols: number;
        /**
         * UShort. The size of the optional header, in bytes. This value should be 0 for object files.
         */
        sizeOfOptionalHeader: number;
        /**
         * The characteristics of the image.
         */
        characteristics: ImageCharacteristics;
        toString(): string;
        read(reader: io.BufferReader): void;
    }
}
declare module pe.headers {
    class AddressRange {
        address: number;
        size: number;
        constructor(address?: number, size?: number);
        mapRelative(offset: number): number;
        toString(): string;
    }
    class AddressRangeMap extends AddressRange {
        virtualAddress: number;
        constructor(address?: number, size?: number, virtualAddress?: number);
        toString(): string;
    }
    class SectionHeader extends AddressRangeMap {
        static intSize: number;
        /**
         * An 8-byte, null-padded UTF-8 string.
         * There is no terminating null character if the string is exactly eight characters long.
         * For longer names, this member contains a forward slash (/)
         * followed by an ASCII representation of a decimal number that is an offset into the string table.
         * Executable images do not use a string table
         * and do not support section names longer than eight characters.
         */
        name: string;
        /**
         * If virtualSize value is greater than the size member, the section is filled with zeroes.
         * This field is valid only for executable images and should be set to 0 for object files.
         */
        virtualSize: number;
        /**
         * A file pointer to the beginning of the relocation entries for the section.
         * If there are no relocations, this value is zero.
         */
        pointerToRelocations: number;
        /**
         * A file pointer to the beginning of the line-number entries for the section.
         * If there are no COFF line numbers, this value is zero.
         */
        pointerToLinenumbers: number;
        /**
         * Ushort.
         * The number of relocation entries for the section.
         * This value is zero for executable images.
         */
        numberOfRelocations: number;
        /**
         * Ushort.
         * The number of line-number entries for the section.
         */
        numberOfLinenumbers: number;
        /**
         * The characteristics of the image.
         */
        characteristics: SectionCharacteristics;
        constructor();
        toString(): string;
        read(reader: io.BufferReader): void;
    }
}
declare module pe.io {
    class BufferReader {
        offset: number;
        sections: headers.AddressRangeMap[];
        private _currentSectionIndex;
        private _currentView;
        constructor(array: number[]);
        constructor(buffer: ArrayBuffer);
        constructor(view: DataView);
        readByte(): number;
        peekByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): Long;
        readBytes(length: number): Uint8Array;
        readZeroFilledAscii(length: number): string;
        readAsciiZ(maxLength?: number): string;
        readUtf8Z(maxLength: number): string;
        getVirtualOffset(): number;
        setVirtualOffset(rva: number): void;
        private _getView(numBytes);
        private _tryMapToVirtual(offset);
    }
    class ArrayReader extends BufferReader {
        private _array;
        offset: number;
        sections: headers.AddressRangeMap[];
        constructor(_array: number[]);
        readByte(): number;
        peekByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): Long;
        readBytes(length: number): Uint8Array;
        readZeroFilledAscii(length: number): string;
        readAsciiZ(maxLength?: number): string;
        readUtf8Z(maxLength: number): string;
        getVirtualOffset(): number;
        setVirtualOffset(rva: number): void;
        private _tryMapToVirtual2(offset);
    }
    function getFileBufferReader(file: File, onsuccess: (BufferReader) => void, onfailure: (Error) => void): void;
    function getUrlBufferReader(url: string, onsuccess: (BufferReader) => void, onfailure: (Error) => void): void;
}
declare module pe.managed {
    class AppDomain {
        assemblies: Assembly[];
        mscorlib: Assembly;
        unresolvedAssemblies: Assembly[];
        constructor();
        read(reader: io.BufferReader, async?: AsyncCallback<Assembly>): Assembly;
        resolveAssembly(name: string, version: string, publicKeyToken: string, culture: string): Assembly;
    }
}
declare module pe.managed {
    class Assembly {
        isSpeculative: boolean;
        fileHeaders: headers.PEFileHeaders;
        name: string;
        version: string;
        publicKey: number[];
        publicKeyToken: string;
        culture: string;
        attributes: metadata.AssemblyFlags;
        runtimeVersion: string;
        specificRuntimeVersion: string;
        imageFlags: metadata.ClrImageFlags;
        metadataVersion: string;
        tableStreamVersion: string;
        generation: number;
        moduleName: string;
        mvid: string;
        encId: string;
        encBaseId: string;
        types: Type[];
        customAttributes: any[];
        toString(): string;
    }
}
declare module pe.managed {
    class EventInfo {
        owner: Type;
        name: string;
        eventType: Type;
        toString(): string;
    }
}
declare module pe.managed {
    class FieldInfo {
        attributes: metadata.FieldAttributes;
        name: string;
        fieldType: Type;
        fieldOffset: number;
        customAttributes: any[];
        toString(): string;
    }
}
declare module pe.managed {
    class MethodInfo {
        owner: Type;
        name: string;
        attributes: metadata.MethodAttributes;
        parameters: ParameterInfo[];
        customAttributes: any[];
        toString(): string;
    }
}
declare module pe.managed {
    class ParameterInfo {
        owner: MethodInfo;
        name: string;
        attributes: metadata.ParamAttributes;
        customAttributes: any[];
        parameterType: Type;
        toString(): string;
    }
}
declare module pe.managed {
    class PropertyInfo {
        owner: Type;
        name: string;
        propertyType: Type;
        attributes: metadata.PropertyAttributes;
        customAttributes: any[];
    }
}
declare module pe.managed {
    class Type {
        baseType: Type;
        assembly: Assembly;
        namespace: string;
        name: string;
        isSpeculative: boolean;
        attributes: metadata.TypeAttributes;
        fields: FieldInfo[];
        methods: MethodInfo[];
        properties: PropertyInfo[];
        events: EventInfo[];
        genericPrototype: Type;
        genericArguments: Type[];
        interfaces: Type[];
        netedTypes: Type[];
        nestingParent: Type;
        layout: {
            packingSize: number;
            classSize: number;
        };
        customAttributes: any[];
        constructor(baseType?: Type, assembly?: Assembly, namespace?: string, name?: string);
        getBaseType(): Type;
        getAssembly(): Assembly;
        getFullName(): string;
        toString(): string;
    }
}
declare module pe.managed.metadata {
    class ClrDirectory {
        private static _clrHeaderSize;
        cb: number;
        runtimeVersion: string;
        imageFlags: metadata.ClrImageFlags;
        metadataDir: headers.AddressRange;
        entryPointToken: number;
        resourcesDir: headers.AddressRange;
        strongNameSignatureDir: headers.AddressRange;
        codeManagerTableDir: headers.AddressRange;
        vtableFixupsDir: headers.AddressRange;
        exportAddressTableJumpsDir: headers.AddressRange;
        managedNativeHeaderDir: headers.AddressRange;
        read(readerAtClrDataDirectory: io.BufferReader): void;
    }
}
declare module pe.managed.metadata {
    class ClrMetadata {
        mdSignature: metadata.ClrMetadataSignature;
        metadataVersion: string;
        runtimeVersion: string;
        mdReserved: number;
        mdFlags: number;
        streamCount: number;
        read(clrDirReader: io.BufferReader): void;
    }
}
declare module pe.managed.metadata {
    class CodedIndexReader {
        tables: any[][];
        tableKinds: number[];
        tableKindBitCount: number;
        rowIndexBitCount: number;
        isShortForm: boolean;
        constructor(tables: any[][], tableKinds: number[]);
        readCodedIndex(reader: io.BufferReader): number;
        lookup(codedIndex: number): any;
    }
}
declare module pe.managed.metadata {
    class CodedIndexReaders {
        private _tables;
        resolutionScope: CodedIndexReader;
        typeDefOrRef: CodedIndexReader;
        hasConstant: CodedIndexReader;
        hasCustomAttribute: CodedIndexReader;
        customAttributeType: CodedIndexReader;
        hasDeclSecurity: CodedIndexReader;
        implementation: CodedIndexReader;
        hasFieldMarshal: CodedIndexReader;
        typeOrMethodDef: CodedIndexReader;
        memberForwarded: CodedIndexReader;
        memberRefParent: CodedIndexReader;
        methodDefOrRef: CodedIndexReader;
        hasSemantics: CodedIndexReader;
        constructor(_tables: any[][]);
    }
}
declare module pe.managed.metadata {
    class MetadataStreams {
        guids: string[];
        strings: headers.AddressRange;
        blobs: headers.AddressRange;
        tables: headers.AddressRange;
        read(metadataBaseAddress: number, streamCount: number, reader: io.BufferReader): void;
        private _readAlignedNameString(reader);
        private _readGuidForStream(reader);
    }
}
declare module pe.managed.metadata {
    /** ECMA-335 II.23.2 */
    class SignatureReader {
        private _tables;
        constructor(_tables: any[][]);
        /** ECMA-335 II.23.2.1 */
        readMethodDefSig(reader: io.BufferReader, def: managed.MethodInfo): void;
        /** ECMA-335 II.23.2.2 */
        readMethodRefSig(reader: io.BufferReader): void;
        /** ECMA-335 II.23.2.3 */
        readStandAloneMethodSig(reader: io.BufferReader, def: any): void;
        /** ECMA-335 II.23.2.4 */
        readFieldSig(reader: io.BufferReader, def: managed.FieldInfo): void;
        /** ECMA-335 II.23.2.5 */
        readPropertySig(reader: io.BufferReader, def: managed.PropertyInfo): void;
        /** ECMA-335 II.23.2.5 */
        readLocalVarSig(reader: io.BufferReader): void;
        readRefType(reader: io.BufferReader): Type;
        readConstraint(reader: io.BufferReader): void;
        readParam(reader: io.BufferReader): void;
        readCustomMod(reader: io.BufferReader): void;
        readType(reader: io.BufferReader): Type;
        private _readCompressed(reader);
        private _readCompressedSigned(reader);
    }
    module SignatureReader {
        /** ECMA-335 II.23.2.3 */
        enum CallingConvention {
            Default = 0,
            /** This is a vararg signature too! */
            C = 1,
            StdCall = 2,
            ThisCall = 3,
            FastCall = 4,
            VarArg = 5,
            Field = 6,
            Property = 8,
            Local = 7,
            Generic = 16,
            HasThis = 32,
            ExplicitThis = 64,
            /** ECMA-335 II.23.1.16 and II.15.3 */
            Sentinel = 65,
        }
    }
}
declare module pe.managed.metadata {
    class TableCompletionReader {
        private _appDomain;
        private _tableStream;
        private _metadataStreams;
        private _codedIndexReaders;
        readPublicKey: (blobIndex: number) => number[];
        constructor(_appDomain: AppDomain, _tableStream: TableStream, _metadataStreams: MetadataStreams, _codedIndexReaders: CodedIndexReaders, readPublicKey: (blobIndex: number) => number[]);
        readString(index: number): string;
        readGuid(index: number): string;
        copyFieldRange(fields: FieldInfo[], start: number, end?: number, owner?: Type): void;
        copyMethodRange(methods: MethodInfo[], start: number, end?: number, owner?: Type): void;
        copyParamRange(parameters: ParameterInfo[], start: number, end: number, owner?: MethodInfo): void;
        private _copyDefRange(defs, tableKind, start, end?, owner?);
        lookupTable(tableKind: TableKind, tableIndex: number): any;
        lookupResolutionScope(codedIndex: number): any;
        lookupTypeDefOrRef(codedIndex: number): Type;
        lookupHasConstant(codedIndex: number): any;
        lookupHasCustomAttribute(codedIndex: number): any;
        lookupCustomAttributeType(codedIndex: number): any;
        lookupHasDeclSecurity(codedIndex: number): any;
        lookupImplementation(codedIndex: number): any;
        lookupHasFieldMarshal(codedIndex: number): any;
        lookupTypeOrMethodDef(codedIndex: number): any;
        lookupMemberForwarded(codedIndex: number): any;
        lookupMemberRefParent(codedIndex: number): any;
        lookupMethodDefOrRef(codedIndex: number): any;
        lookupHasSemantics(codedIndex: number): any;
        resolveAssemblyRef(name: string, version: string, publicKeyOrToken: string, culture: string): managed.Assembly;
        resolveTypeRef(scope: any, namespace: string, name: string): managed.Type;
        readFieldSignature(field: FieldInfo, blobIndex: number): void;
    }
}
declare module pe.managed.metadata {
    enum TableKind {
        Module = 0,
        TypeRef = 1,
        TypeDef = 2,
        Field = 4,
        MethodDef = 6,
        Param = 8,
        MemberRef = 10,
        Constant = 11,
        CustomAttribute = 12,
        FieldMarshal = 13,
        DeclSecurity = 14,
        ClassLayout = 15,
        InterfaceImpl = 9,
        FieldLayout = 16,
        StandAloneSig = 17,
        EventMap = 18,
        Event = 20,
        PropertyMap = 21,
        Property = 23,
        MethodSemantics = 24,
        MethodImpl = 25,
        ModuleRef = 26,
        TypeSpec = 27,
        ImplMap = 28,
        FieldRVA = 29,
        Assembly = 32,
        AssemblyProcessor = 33,
        AssemblyOS = 34,
        AssemblyRef = 35,
        AssemblyRefProcessor = 36,
        AssemblyRefOS = 37,
        File = 38,
        ExportedType = 39,
        ManifestResource = 40,
        NestedClass = 41,
        GenericParam = 42,
        MethodSpec = 43,
        GenericParamConstraint = 44,
    }
}
declare module pe.managed.metadata {
    class TableReader {
        private _reader;
        private _tables;
        private _codedIndexReaders;
        stringIndices: string[];
        constructor(_reader: io.BufferReader, _tables: any[][], stringCount: number, guidCount: number, blobCount: number, _codedIndexReaders: CodedIndexReaders);
        private readStringIndex;
        readString(): number;
        private _getDirectReader(spaceSize);
        private _getTableIndexReader(tableKind);
        private _getCodedIndexReader(tables);
        readByte(): number;
        readShort(): number;
        readInt(): number;
        readGuid: () => number;
        readResolutionScope(): number;
        readTypeDefOrRef(): number;
        readHasConstant(): number;
        readHasCustomAttribute(): number;
        readCustomAttributeType(): number;
        readHasDeclSecurity(): number;
        readImplementation(): number;
        readHasFieldMarshal(): number;
        readTypeOrMethodDef(): number;
        readMemberForwarded(): number;
        readMemberRefParent(): number;
        readMethodDefOrRef(): number;
        readHasSemantics(): number;
        readBlobIndex: () => number;
        readGenericParamTableIndex: () => number;
        readParamTableIndex: () => number;
        readFieldTableIndex: () => number;
        readMethodDefTableIndex: () => number;
        readTypeDefTableIndex: () => number;
        readEventTableIndex: () => number;
        readPropertyTableIndex: () => number;
        readModuleRefTableIndex: () => number;
        readAssemblyTableIndex: () => number;
    }
}
declare module pe.managed.metadata {
    class TableStream {
        reserved0: number;
        version: string;
        heapSizes: number;
        reserved1: number;
        tables: any[][];
        stringIndices: string[];
        codedIndexReaders: CodedIndexReaders;
        read(reader: io.BufferReader, stringCount: number, guidCount: number, blobCount: number): void;
        private _readTableRowCounts(valid, tableReader);
        private _populateTableObjects(table, Ctor, count);
        private _populateTableRows(tableCounts);
        private _readTableRows(tableCounts, reader);
    }
}
declare module pe.managed.metadata {
    function calcRequredBitCount(maxValue: any): number;
}
declare var jsSHA: any;
declare module pe.managed.tables {
    /** ECMA-335 II.22.2 */
    class Assembly {
        def: managed.Assembly;
        hashAlgId: metadata.AssemblyHashAlgorithm;
        majorVersion: number;
        minorVersion: number;
        buildNumber: number;
        revisionNumber: number;
        flags: metadata.AssemblyFlags;
        publicKey: number;
        name: number;
        culture: number;
        read(reader: metadata.TableReader): void;
        precomplete(reader: metadata.TableCompletionReader): void;
        private _hashPublicKey(pk);
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.3 */
    class AssemblyOS {
        TableKind: number;
        osPlatformId: number;
        osMajorVersion: number;
        osMinorVersion: number;
        read(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.4 */
    class AssemblyProcessor {
        TableKind: number;
        processor: number;
        reader(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.5 */
    class AssemblyRef {
        def: managed.Assembly;
        majorVersion: number;
        minorVersion: number;
        buildNumber: number;
        revisionNumber: number;
        flags: metadata.AssemblyFlags;
        publicKeyOrToken: number;
        name: number;
        culture: number;
        hashValue: number;
        read(reader: metadata.TableReader): void;
        precomplete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.2.6 */
    class AssemblyRefOs {
        TableKind: number;
        osPlatformId: number;
        osMajorVersion: number;
        osMinorVersion: number;
        assemblyRef: number;
        read(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.7 */
    class AssemblyRefProcessor {
        TableKind: number;
        processor: number;
        read(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.8 */
    class ClassLayout {
        TableKind: number;
        packingSize: number;
        classSize: number;
        parent: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.9 */
    class Constant {
        TableKind: number;
        type: number;
        parent: number;
        value: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.10 */
    class CustomAttribute {
        TableKind: number;
        parent: number;
        type: number;
        value: number;
        read(reader: metadata.TableReader): void;
        static fire: boolean;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.11 */
    class DeclSecurity {
        action: number;
        parent: number;
        permissionSet: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.13 */
    class Event {
        def: EventInfo;
        eventFlags: metadata.EventAttributes;
        name: number;
        eventType: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.12 */
    class EventMap {
        parent: number;
        eventList: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.14 */
    class ExportedType {
        flags: metadata.TypeAttributes;
        typeDefId: number;
        typeName: number;
        typeNamespace: number;
        implementation: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.15 */
    class Field {
        def: FieldInfo;
        name: number;
        signature: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.8 */
    class FieldLayout {
        TableKind: number;
        offset: number;
        field: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.17 */
    class FieldMarshal {
        TableKind: number;
        parent: number;
        nativeType: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.18 */
    class FieldRVA {
        TableKind: number;
        rva: number;
        field: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.19 */
    class File {
        TableKind: number;
        flags: metadata.FileAttributes;
        name: number;
        hashValue: number;
        read(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.20 */
    class GenericParam {
        TableKind: number;
        def: Type;
        number_: number;
        owner: number;
        name: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.21 */
    class GenericParamConstraint {
        owner: number;
        constraint: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.22 */
    class ImplMap {
        TableKind: number;
        mappingFlags: metadata.PInvokeAttributes;
        memberForwarded: number;
        importName: number;
        importScope: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.33 */
    class InterfaceImpl {
        class_: number;
        interface_: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.24 */
    class ManifestResource {
        offset: number;
        flags: metadata.ManifestResourceAttributes;
        name: number;
        implementation: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.25 */
    class MemberRef {
        TableKind: number;
        def: MethodInfo;
        class_: number;
        name: number;
        signature: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.26 */
    class MethodDef {
        def: MethodInfo;
        rva: number;
        implAttributes: metadata.MethodImplAttributes;
        attributes: metadata.MethodAttributes;
        name: number;
        signature: number;
        paramList: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader, nextMethodDef?: MethodDef): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.27 */
    class MethodImpl {
        TableKind: number;
        class_: number;
        methodBody: number;
        methodDeclaration: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.28 */
    class MethodSemantics {
        TableKind: number;
        semantics: metadata.MethodSemanticsAttributes;
        method: number;
        association: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.29 */
    class MethodSpec {
        method: number;
        instantiation: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.30 */
    class Module {
        def: {
            generation: number;
            moduleName: string;
            mvid: string;
            encId: string;
            encBaseId: string;
        };
        name: number;
        mvid: number;
        encId: number;
        encBaseId: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.31 */
    class ModuleRef {
        name: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.32 */
    class NestedClass {
        nestedClass: number;
        enclosingClass: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.33 */
    class Param {
        def: ParameterInfo;
        sequence: number;
        name: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.34 */
    class Property {
        def: PropertyInfo;
        name: number;
        type: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.35 */
    class PropertyMap {
        parent: number;
        propertyList: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.36 */
    class StandAloneSig {
        signature: number;
        read(reader: metadata.TableReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.37 */
    class TypeDef {
        def: Type;
        name: number;
        namespace: number;
        extends_: number;
        fieldList: number;
        methodList: number;
        constructor();
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader, nextTypeDef?: TypeDef): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.38 */
    class TypeRef {
        def: Type;
        resolutionScope: number;
        name: number;
        namespace: number;
        read(reader: metadata.TableReader): void;
        precomplete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.managed.tables {
    /** ECMA-335 II.22.39 */
    class TypeSpec {
        def: Type;
        signature: number;
        read(reader: metadata.TableReader): void;
        complete(reader: metadata.TableCompletionReader): void;
    }
}
declare module pe.unmanaged {
    class DllExport {
        name: string;
        ordinal: number;
        /**
         * The address of the exported symbol when loaded into memory, relative to the image base.
         * For example, the address of an exported function.
         */
        exportRva: number;
        /**
         * Null-terminated ASCII string in the export section.
         * This string must be within the range that is given by the export table data directory entry.
         * This string gives the DLL name and the name of the export (for example, "MYDLL.expfunc")
         * or the DLL name and the ordinal number of the export (for example, "MYDLL.#27").
         */
        forwarder: string;
        static readExports(reader: io.BufferReader, range: headers.AddressRange): DllExports;
        private readExportEntry(reader, range);
    }
}
declare module pe.unmanaged {
    interface DllExports {
        length: number;
        [i: number]: DllExport;
        /** Reserved, must be 0. */
        flags: number;
        /** The time and date that the export data was created. */
        timestamp: Date;
        /** The version number. The major and minor version numbers can be set by the user. */
        version: string;
        /** The ASCII string that contains the name of the DLL. This address is relative to the image base. */
        dllName: any;
        /**
         * The starting ordinal number for exports in this image.
         * This field specifies the starting ordinal number for the export address table.
         * It is usually set to 1.
         */
        ordinalBase: any;
    }
}
declare module pe.unmanaged {
    class DllImport {
        name: string;
        ordinal: number;
        dllName: string;
        timeDateStamp: Date;
        static read(reader: io.BufferReader, result?: DllImport[]): DllImport[];
        private readEntry(reader);
    }
}
declare module pe.unmanaged {
    class ResourceDataEntry {
        name: string;
        integerId: number;
        dataRva: number;
        size: number;
        codepage: number;
        reserved: number;
        toString(): string;
    }
}
declare module pe.unmanaged {
    class ResourceDirectory {
        /** Resource flags. This field is reserved for future use. It is currently set to zero. */
        characteristics: number;
        /** The time that the resource data was created by the resource compiler. */
        timestamp: Date;
        /** The version number, set by the user. */
        version: string;
        subdirectories: ResourceDirectoryEntry[];
        dataEntries: ResourceDataEntry[];
        toString(): string;
        read(reader: io.BufferReader): void;
        private readCore(reader, baseVirtualOffset);
        readName(reader: io.BufferReader): string;
    }
}
declare module pe.unmanaged {
    class ResourceDirectoryEntry {
        name: string;
        integerId: number;
        directory: ResourceDirectory;
        toString(): string;
    }
}
