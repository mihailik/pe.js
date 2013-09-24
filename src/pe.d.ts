declare module pe.io {
    /**
    * 64-bit integer
    */
    class Long {
        public lo: number;
        public hi: number;
        constructor(lo: number, hi: number);
        public toString(): string;
    }
    /**
    * Address and size of a chunk of memory
    */
    class AddressRange {
        public address: number;
        public size: number;
        constructor(address?: number, size?: number);
        public mapRelative(offset: number): number;
        public toString(): string;
    }
    class AddressRangeMap extends AddressRange {
        public virtualAddress: number;
        constructor(address?: number, size?: number, virtualAddress?: number);
        public toString(): string;
    }
    class BufferReader {
        private _view;
        public offset: number;
        public sections: AddressRangeMap[];
        private _currentSectionIndex;
        constructor(array: number[]);
        constructor(buffer: ArrayBuffer);
        constructor(view: DataView);
        public readByte(): number;
        public peekByte(): number;
        public readShort(): number;
        public readInt(): number;
        public readLong(): Long;
        public readBytes(length: number): Uint8Array;
        public readZeroFilledAscii(length: number): string;
        public readAsciiZ(maxLength?: number): string;
        public readUtf8Z(maxLength: number): string;
        public getVirtualOffset(): number;
        public setVirtualOffset(rva: number): void;
        private tryMapToVirtual(offset);
    }
    class ArrayReader extends BufferReader {
        private _array;
        public offset: number;
        public sections: AddressRangeMap[];
        constructor(_array: number[]);
        public readByte(): number;
        public peekByte(): number;
        public readShort(): number;
        public readInt(): number;
        public readLong(): Long;
        public readBytes(length: number): Uint8Array;
        public readZeroFilledAscii(length: number): string;
        public readAsciiZ(maxLength?: number): string;
        public readUtf8Z(maxLength: number): string;
        public getVirtualOffset(): number;
        public setVirtualOffset(rva: number): void;
        private _tryMapToVirtual(offset);
    }
    function getFileBufferReader(file: File, onsuccess: (BufferReader: any) => void, onfailure: (Error: any) => void): void;
    function getUrlBufferReader(url: string, onsuccess: (BufferReader: any) => void, onfailure: (Error: any) => void): void;
    function bytesToHex(bytes: Uint8Array): string;
    function formatEnum(value: any, type: any): string;
}
declare module pe.headers {
    class PEFileHeaders {
        public dosHeader: DosHeader;
        public dosStub: Uint8Array;
        public peHeader: PEHeader;
        public optionalHeader: OptionalHeader;
        public sectionHeaders: SectionHeader[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    class DosHeader {
        public mz: MZSignature;
        public cblp: number;
        public cp: number;
        public crlc: number;
        public cparhdr: number;
        public minalloc: number;
        public maxalloc: number;
        public ss: number;
        public sp: number;
        public csum: number;
        public ip: number;
        public cs: number;
        public lfarlc: number;
        public ovno: number;
        public res1: pe.io.Long;
        public oemid: number;
        public oeminfo: number;
        public reserved: number[];
        public lfanew: number;
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum MZSignature {
        MZ,
    }
    class PEHeader {
        public pe: PESignature;
        public machine: Machine;
        public numberOfSections: number;
        public timestamp: Date;
        public pointerToSymbolTable: number;
        public numberOfSymbols: number;
        public sizeOfOptionalHeader: number;
        public characteristics: ImageCharacteristics;
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum PESignature {
        PE,
    }
    enum Machine {
        Unknown = 0x0000,
        I386 = 0x014C,
        R3000 = 0x0162,
        R4000 = 0x0166,
        R10000 = 0x0168,
        WCEMIPSV2 = 0x0169,
        Alpha = 0x0184,
        SH3 = 0x01a2,
        SH3DSP = 0x01a3,
        SH3E = 0x01a4,
        SH4 = 0x01a6,
        SH5 = 0x01a8,
        ARM = 0x01c0,
        Thumb = 0x01c2,
        AM33 = 0x01d3,
        PowerPC = 0x01F0,
        PowerPCFP = 0x01f1,
        IA64 = 0x0200,
        MIPS16 = 0x0266,
        Alpha64 = 0x0284,
        MIPSFPU = 0x0366,
        MIPSFPU16 = 0x0466,
        AXP64,
        Tricore = 0x0520,
        CEF = 0x0CEF,
        EBC = 0x0EBC,
        AMD64 = 0x8664,
        M32R = 0x9041,
        CEE = 0xC0EE,
    }
    enum ImageCharacteristics {
        RelocsStripped = 0x0001,
        ExecutableImage = 0x0002,
        LineNumsStripped = 0x0004,
        LocalSymsStripped = 0x0008,
        AggressiveWsTrim = 0x0010,
        LargeAddressAware = 0x0020,
        BytesReversedLo = 0x0080,
        Bit32Machine = 0x0100,
        DebugStripped = 0x0200,
        RemovableRunFromSwap = 0x0400,
        NetRunFromSwap = 0x0800,
        System = 0x1000,
        Dll = 0x2000,
        UpSystemOnly = 0x4000,
        BytesReversedHi = 0x8000,
    }
    class OptionalHeader {
        public peMagic: PEMagic;
        public linkerVersion: string;
        public sizeOfCode: number;
        public sizeOfInitializedData: number;
        public sizeOfUninitializedData: number;
        public addressOfEntryPoint: number;
        public baseOfCode: number;
        public baseOfData: number;
        public imageBase: any;
        public sectionAlignment: number;
        public fileAlignment: number;
        public operatingSystemVersion: string;
        public imageVersion: string;
        public subsystemVersion: string;
        public win32VersionValue: number;
        public sizeOfImage: number;
        public sizeOfHeaders: number;
        public checkSum: number;
        public subsystem: Subsystem;
        public dllCharacteristics: DllCharacteristics;
        public sizeOfStackReserve: any;
        public sizeOfStackCommit: any;
        public sizeOfHeapReserve: any;
        public sizeOfHeapCommit: any;
        public loaderFlags: number;
        public numberOfRvaAndSizes: number;
        public dataDirectories: pe.io.AddressRange[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum PEMagic {
        NT32 = 0x010B,
        NT64 = 0x020B,
        ROM = 0x107,
    }
    enum Subsystem {
        Unknown = 0,
        Native = 1,
        WindowsGUI = 2,
        WindowsCUI = 3,
        OS2CUI = 5,
        POSIXCUI = 7,
        NativeWindows = 8,
        WindowsCEGUI = 9,
        EFIApplication = 10,
        EFIBootServiceDriver = 11,
        EFIRuntimeDriver = 12,
        EFIROM = 13,
        XBOX = 14,
        BootApplication = 16,
    }
    enum DllCharacteristics {
        ProcessInit = 0x0001,
        ProcessTerm = 0x0002,
        ThreadInit = 0x0004,
        ThreadTerm = 0x0008,
        DynamicBase = 0x0040,
        ForceIntegrity = 0x0080,
        NxCompatible = 0x0100,
        NoIsolation = 0x0200,
        NoSEH = 0x0400,
        NoBind = 0x0800,
        AppContainer = 0x1000,
        WdmDriver = 0x2000,
        Reserved = 0x4000,
        TerminalServerAware = 0x8000,
    }
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
        Clr = 14,
    }
    class SectionHeader extends pe.io.AddressRangeMap {
        public name: string;
        public virtualSize: number;
        public pointerToRelocations: number;
        public pointerToLinenumbers: number;
        public numberOfRelocations: number;
        public numberOfLinenumbers: number;
        public characteristics: SectionCharacteristics;
        constructor();
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
    }
    enum SectionCharacteristics {
        Reserved_0h = 0x00000000,
        Reserved_1h = 0x00000001,
        Reserved_2h = 0x00000002,
        Reserved_4h = 0x00000004,
        NoPadding = 0x00000008,
        Reserved_10h = 0x00000010,
        ContainsCode = 0x00000020,
        ContainsInitializedData = 0x00000040,
        ContainsUninitializedData = 0x00000080,
        LinkerOther = 0x00000100,
        LinkerInfo = 0x00000200,
        Reserved_400h = 0x00000400,
        LinkerRemove = 0x00000800,
        LinkerCOMDAT = 0x00001000,
        Reserved_2000h = 0x00002000,
        NoDeferredSpeculativeExecution = 0x00004000,
        GlobalPointerRelative = 0x00008000,
        Reserved_10000h = 0x00010000,
        MemoryPurgeable = 0x00020000,
        MemoryLocked = 0x00040000,
        MemoryPreload = 0x00080000,
        Align1Bytes = 0x00100000,
        Align2Bytes = 0x00200000,
        Align4Bytes = 0x00300000,
        Align8Bytes = 0x00400000,
        Align16Bytes = 0x00500000,
        Align32Bytes = 0x00600000,
        Align64Bytes = 0x00700000,
        Align128Bytes = 0x00800000,
        Align256Bytes = 0x00900000,
        Align512Bytes = 0x00A00000,
        Align1024Bytes = 0x00B00000,
        Align2048Bytes = 0x00C00000,
        Align4096Bytes = 0x00D00000,
        Align8192Bytes = 0x00E00000,
        LinkerRelocationOverflow = 0x01000000,
        MemoryDiscardable = 0x02000000,
        MemoryNotCached = 0x04000000,
        MemoryNotPaged = 0x08000000,
        MemoryShared = 0x10000000,
        MemoryExecute = 0x20000000,
        MemoryRead = 0x40000000,
        MemoryWrite = 0x80000000,
    }
}
declare module pe.unmanaged {
    class DllExport {
        public name: string;
        public ordinal: number;
        public exportRva: number;
        public forwarder: string;
        static readExports(reader: pe.io.BufferReader, range: pe.io.AddressRange): DllExports;
        private readExportEntry(reader, range);
    }
    interface DllExports {
        length: number;
        [i: number]: DllExport;
        flags: number;
        timestamp: Date;
        version: string;
        dllName: any;
        ordinalBase: any;
    }
    class DllImport {
        public name: string;
        public ordinal: number;
        public dllName: string;
        public timeDateStamp: Date;
        static read(reader: pe.io.BufferReader, result?: DllImport[]): DllImport[];
        private readEntry(reader);
    }
    class ResourceDirectory {
        public characteristics: number;
        public timestamp: Date;
        public version: string;
        public subdirectories: ResourceDirectoryEntry[];
        public dataEntries: ResourceDataEntry[];
        public toString(): string;
        public read(reader: pe.io.BufferReader): void;
        private readCore(reader, baseVirtualOffset);
        public readName(reader: pe.io.BufferReader): string;
    }
    class ResourceDirectoryEntry {
        public name: string;
        public integerId: number;
        public directory: ResourceDirectory;
        public toString(): string;
    }
    class ResourceDataEntry {
        public name: string;
        public integerId: number;
        public dataRva: number;
        public size: number;
        public codepage: number;
        public reserved: number;
        public toString(): string;
    }
}
declare module pe.managed {
    enum ClrImageFlags {
        ILOnly = 0x00000001,
        _32BitRequired = 0x00000002,
        ILLibrary = 0x00000004,
        StrongNameSigned = 0x00000008,
        NativeEntryPoint = 0x00000010,
        TrackDebugData = 0x00010000,
        IsIbcoptimized = 0x00020000,
    }
    enum ClrMetadataSignature {
        Signature = 0x424a5342,
    }
    enum AssemblyHashAlgorithm {
        None = 0x0000,
        Reserved = 0x8003,
        Sha1 = 0x8004,
    }
    enum AssemblyFlags {
        PublicKey = 0x0001,
        Retargetable = 0x0100,
        DisableJITcompileOptimizer = 0x4000,
        EnableJITcompileTracking = 0x8000,
    }
    enum ElementType {
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
        Ptr = 0x0f,
        ByRef = 0x10,
        ValueType = 0x11,
        Class = 0x12,
        Var = 0x13,
        Array = 0x14,
        GenericInst = 0x15,
        TypedByRef = 0x16,
        I = 0x18,
        U = 0x19,
        FnPtr = 0x1b,
        Object = 0x1c,
        SZArray = 0x1d,
        MVar = 0x1e,
        CMod_ReqD = 0x1f,
        CMod_Opt = 0x20,
        Internal = 0x21,
        Modifier = 0x40,
        Sentinel,
        Pinned,
        R4_Hfa,
        R8_Hfa,
        ArgumentType_,
        CustomAttribute_BoxedObject_,
        CustomAttribute_Field_,
        CustomAttribute_Property_,
        CustomAttribute_Enum_ = 0x55,
    }
    enum SecurityAction {
        Assert = 3,
        Demand = 2,
        Deny = 4,
        InheritanceDemand = 7,
        LinkDemand = 6,
        NonCasDemand = 0,
        NonCasLinkDemand = 0,
        PrejitGrant = 0,
        PermitOnly = 5,
        RequestMinimum = 8,
        RequestOptional = 9,
        RequestRefuse = 10,
    }
    enum EventAttributes {
        SpecialName = 0x0200,
        RTSpecialName = 0x0400,
    }
    enum TypeAttributes {
        VisibilityMask = 0x00000007,
        NotPublic = 0x00000000,
        Public = 0x00000001,
        NestedPublic = 0x00000002,
        NestedPrivate = 0x00000003,
        NestedFamily = 0x00000004,
        NestedAssembly = 0x00000005,
        NestedFamANDAssem = 0x00000006,
        NestedFamORAssem = 0x00000007,
        LayoutMask = 0x00000018,
        AutoLayout = 0x00000000,
        SequentialLayout = 0x00000008,
        ExplicitLayout = 0x00000010,
        ClassSemanticsMask = 0x00000020,
        Class = 0x00000000,
        Interface = 0x00000020,
        Abstract = 0x00000080,
        Sealed = 0x00000100,
        SpecialName = 0x00000400,
        Import = 0x00001000,
        Serializable = 0x00002000,
        StringFormatMask = 0x00030000,
        AnsiClass = 0x00000000,
        UnicodeClass = 0x00010000,
        AutoClass = 0x00020000,
        CustomFormatClass = 0x00030000,
        CustomStringFormatMask = 0x00C00000,
        BeforeFieldInit = 0x00100000,
        RTSpecialName = 0x00000800,
        HasSecurity = 0x00040000,
        IsTypeForwarder = 0x00200000,
    }
    enum FieldAttributes {
        FieldAccessMask = 0x0007,
        CompilerControlled = 0x0000,
        Private = 0x0001,
        FamANDAssem = 0x0002,
        Assembly = 0x0003,
        Family = 0x0004,
        FamORAssem = 0x0005,
        Public = 0x0006,
        Static = 0x0010,
        InitOnly = 0x0020,
        Literal = 0x0040,
        NotSerialized = 0x0080,
        SpecialName = 0x0200,
        PInvokeImpl = 0x2000,
        RTSpecialName = 0x0400,
        HasFieldMarshal = 0x1000,
        HasDefault = 0x8000,
        HasFieldRVA = 0x0100,
    }
    enum FileAttributes {
        ContainsMetaData = 0x0000,
        ContainsNoMetaData = 0x0001,
    }
    enum GenericParamAttributes {
        VarianceMask = 0x0003,
        None = 0x0000,
        Covariant = 0x0001,
        Contravariant = 0x0002,
        SpecialConstraintMask = 0x001C,
        ReferenceTypeConstraint = 0x0004,
        NotNullableValueTypeConstraint = 0x0008,
        DefaultConstructorConstraint = 0x0010,
    }
    enum PInvokeAttributes {
        NoMangle = 0x0001,
        CharSetMask = 0x0006,
        CharSetNotSpec = 0x0000,
        CharSetAnsi = 0x0002,
        CharSetUnicode = 0x0004,
        CharSetAuto = 0x0006,
        SupportsLastError = 0x0040,
        CallConvMask = 0x0700,
        CallConvPlatformapi = 0x0100,
        CallConvCdecl = 0x0200,
        CallConvStdcall = 0x0300,
        CallConvThiscall = 0x0400,
        CallConvFastcall = 0x0500,
    }
    enum ManifestResourceAttributes {
        VisibilityMask = 0x0007,
        Public = 0x0001,
        Private = 0x0002,
    }
    enum MethodImplAttributes {
        CodeTypeMask = 0x0003,
        IL = 0x0000,
        Native = 0x0001,
        OPTIL = 0x0002,
        Runtime = 0x0003,
        ManagedMask = 0x0004,
        Unmanaged = 0x0004,
        Managed = 0x0000,
        ForwardRef = 0x0010,
        PreserveSig = 0x0080,
        InternalCall = 0x1000,
        Synchronized = 0x0020,
        NoInlining = 0x0008,
        MaxMethodImplVal = 0xffff,
        NoOptimization = 0x0040,
    }
    enum MethodAttributes {
        MemberAccessMask = 0x0007,
        CompilerControlled = 0x0000,
        Private = 0x0001,
        FamANDAssem = 0x0002,
        Assem = 0x0003,
        Family = 0x0004,
        FamORAssem = 0x0005,
        Public = 0x0006,
        Static = 0x0010,
        Final = 0x0020,
        Virtual = 0x0040,
        HideBySig = 0x0080,
        VtableLayoutMask = 0x0100,
        ReuseSlot = 0x0000,
        NewSlot = 0x0100,
        Strict = 0x0200,
        Abstract = 0x0400,
        SpecialName = 0x0800,
        PInvokeImpl = 0x2000,
        UnmanagedExport = 0x0008,
        RTSpecialName = 0x1000,
        HasSecurity = 0x4000,
        RequireSecObject = 0x8000,
    }
    enum MethodSemanticsAttributes {
        Setter = 0x0001,
        Getter = 0x0002,
        Other = 0x0004,
        AddOn = 0x0008,
        RemoveOn = 0x0010,
        Fire = 0x0020,
    }
    enum ParamAttributes {
        In = 0x0001,
        Out = 0x0002,
        Optional = 0x0010,
        HasDefault = 0x1000,
        HasFieldMarshal = 0x2000,
        Unused = 0xcfe0,
    }
    enum PropertyAttributes {
        SpecialName = 0x0200,
        RTSpecialName = 0x0400,
        HasDefault = 0x1000,
        Unused = 0xe9ff,
    }
    enum CallingConventions {
        Default = 0x0,
        C = 0x1,
        StdCall = 0x2,
        FastCall = 0x4,
        VarArg = 0x5,
        Generic = 0x10,
        HasThis = 0x20,
        ExplicitThis = 0x40,
        Sentinel = 0x41,
    }
    enum TableKind {
        ModuleDefinition = 0x00,
        ExternalType = 0x01,
        TypeDefinition = 0x02,
        FieldDefinition = 0x04,
        MethodDefinition = 0x06,
        ParameterDefinition = 0x08,
        MemberRef = 0x0A,
        Constant = 0x0B,
        CustomAttribute = 0x0C,
        FieldMarshal = 0x0D,
        DeclSecurity = 0x0E,
        ClassLayout = 0x0F,
        InterfaceImpl = 0x09,
        FieldLayout = 0x10,
        StandAloneSig = 0x11,
        EventMap = 0x12,
        Event = 0x14,
        PropertyMap = 0x15,
        PropertyDefinition = 0x17,
        MethodSemantics = 0x18,
        MethodImpl = 0x19,
        ModuleRef = 0x1A,
        TypeSpec = 0x1B,
        ImplMap = 0x1C,
        FieldRVA = 0x1D,
        AssemblyDefinition = 0x20,
        AssemblyProcessor = 0x21,
        AssemblyOS = 0x22,
        AssemblyRef = 0x23,
        AssemblyRefProcessor = 0x24,
        AssemblyRefOS = 0x25,
        File = 0x26,
        ExportedType = 0x27,
        ManifestResource = 0x28,
        NestedClass = 0x29,
        GenericParam = 0x2A,
        MethodSpec = 0x2B,
        GenericParamConstraint = 0x2C,
    }
    class AssemblyDefinition {
        public headers: pe.headers.PEFileHeaders;
        public hashAlgId: AssemblyHashAlgorithm;
        public version: string;
        public flags: AssemblyFlags;
        public publicKey: string;
        public name: string;
        public culture: string;
        public modules: ModuleDefinition[];
        public read(reader: pe.io.BufferReader): void;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ModuleDefinition {
        public runtimeVersion: string;
        public specificRuntimeVersion: string;
        public imageFlags: ClrImageFlags;
        public metadataVersion: string;
        public tableStreamVersion: string;
        public generation: number;
        public name: string;
        public mvid: string;
        public encId: string;
        public encBaseId: string;
        public types: TypeDefinition[];
        public debugExternalTypeReferences: ExternalType[];
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class TypeReference {
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class MVar extends TypeReference {
        public index: number;
        constructor(index: number);
        public getName(): string;
        public getNamespace(): string;
    }
    class Var extends TypeReference {
        public index: number;
        constructor(index: number);
        public getName(): string;
        public getNamespace(): string;
    }
    class TypeDefinition extends TypeReference {
        public attributes: number;
        public name: string;
        public namespace: string;
        public fields: FieldDefinition[];
        public methods: MethodDefinition[];
        public baseType: any;
        public internalFieldList: number;
        public internalMethodList: number;
        constructor();
        public getName(): string;
        public getNamespace(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldDefinition {
        public attributes: number;
        public name: string;
        public customModifiers: any[];
        public customAttributes: any[];
        public type: TypeReference;
        public value: ConstantValue;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldSignature {
        public customModifiers: any[];
        public type: TypeReference;
    }
    class MethodDefinition {
        public attributes: MethodAttributes;
        public implAttributes: MethodImplAttributes;
        public name: string;
        public parameters: any[];
        public signature: MethodSignature;
        public locals: any[];
        public internalRva: number;
        public internalParamList: number;
        public toString(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class CustomModifier {
        public required: boolean;
        public type: TypeReference;
        constructor(required: boolean, type: TypeReference);
        public toString(): string;
    }
    class ParameterDefinition {
        public attributes: number;
        public name: string;
        public index: number;
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class PropertyDefinition {
        public attributes: number;
        public name: string;
        public isStatic: boolean;
        public customAttributes: any[];
        public customModifiers: any[];
        public type: TypeReference;
        public parameters: any[];
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class LocalVariable {
        public type: TypeReference;
        public customModifiers: any[];
        public isPinned: boolean;
    }
    class ExternalType extends TypeReference {
        public assemblyRef: any;
        private name;
        private namespace;
        constructor(assemblyRef: any, name: string, namespace: string);
        public getName(): string;
        public getNamespace(): string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class PointerType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
    }
    class ByRefType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
    }
    class SZArrayType extends TypeReference {
        public elementType: TypeReference;
        constructor(elementType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class SentinelType extends TypeReference {
        public baseType: TypeReference;
        constructor(baseType: TypeReference);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class KnownType extends TypeReference {
        private name;
        private internalElementType;
        private static byElementType;
        constructor(name: string, internalElementType: ElementType);
        public getName(): string;
        public getNamespace(): string;
        static internalGetByElementName(elementType: ElementType): KnownType;
        static Void: KnownType;
        static Boolean: KnownType;
        static Char: KnownType;
        static SByte: KnownType;
        static Byte: KnownType;
        static Int16: KnownType;
        static UInt16: KnownType;
        static Int32: KnownType;
        static UInt32: KnownType;
        static Int64: KnownType;
        static UInt64: KnownType;
        static Single: KnownType;
        static Double: KnownType;
        static String: KnownType;
        static TypedReference: KnownType;
        static IntPtr: KnownType;
        static UIntPtr: KnownType;
        static Object: KnownType;
        public toString(): string;
    }
    class GenericInstantiation extends TypeReference {
        public genericType: TypeReference;
        public arguments: TypeReference[];
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class FunctionPointerType extends TypeReference {
        public methodSignature: MethodSignature;
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class ArrayType extends TypeReference {
        public elementType: TypeReference;
        public dimensions: ArrayDimensionRange[];
        constructor(elementType: TypeReference, dimensions: ArrayDimensionRange[]);
        public getName(): string;
        public getNamespace(): string;
        public toString(): string;
    }
    class ArrayDimensionRange {
        public lowBound: number;
        public length: number;
        public toString(): string;
    }
    class MethodSignature {
        public callingConvention: CallingConventions;
        public parameters: ParameterSignature[];
        public extraParameters: ParameterSignature[];
        public returnType: TypeReference;
        public toString(): string;
    }
    class ParameterSignature {
        public customModifiers: any[];
        public type: TypeReference;
        constructor(customModifiers: any[], type: TypeReference);
        public toString(): string;
    }
    class ConstantValue {
        public type: TypeReference;
        public value: any;
        constructor(type: TypeReference, value: any);
        public valueOf(): any;
    }
    class CustomAttributeData {
        public fixedArguments: any[];
        public namedArguments: any[];
        constructor();
    }
    class TableStreamReader {
        private baseReader;
        private streams;
        private tables;
        private stringHeapCache;
        constructor(baseReader: pe.io.BufferReader, streams: MetadataStreams, tables: any[][]);
        public readResolutionScope: () => any;
        public readTypeDefOrRef: () => any;
        public readHasConstant: () => any;
        public readHasCustomAttribute: () => any;
        public readCustomAttributeType: () => any;
        public readHasDeclSecurity: () => any;
        public readImplementation: () => any;
        public readHasFieldMarshal: () => any;
        public readTypeOrMethodDef: () => any;
        public readMemberForwarded: () => any;
        public readMemberRefParent: () => any;
        public readMethodDefOrRef: () => any;
        public readHasSemantics: () => any;
        public readByte(): number;
        public readInt(): number;
        public readShort(): number;
        public readString(): string;
        public readGuid(): string;
        public readBlobHex(): string;
        public readBlob(): Uint8Array;
        private readBlobIndex();
        private readBlobSize();
        public readTableRowIndex(tableIndex: number): number;
        private createCodedIndexReader(...tableTypes);
        private readPos(spaceSize);
        public readMethodSignature(definition: MethodSignature): void;
        public readMethodSpec(instantiation: TypeReference[]): void;
        private readSigMethodDefOrRefOrStandalone(sig);
        public readFieldSignature(definition: FieldDefinition): void;
        public readPropertySignature(definition: PropertyDefinition): void;
        public readSigLocalVar(): any[];
        private readSigCustomModifierOrNull();
        private readSigTypeDefOrRefOrSpecEncoded();
        private readSigCustomModifierList();
        private readSigParam();
        private readSigTypeReference();
        private readSigArrayShape(arrayElementType);
        public readMemberSignature(): any;
        private readCompressedInt();
        public readConstantValue(etype: ElementType): any;
        private readSigValue(etype, length);
        public readCustomAttribute(ctorSignature: MethodSignature): CustomAttributeData;
        private readSigFixedArg(type);
        private readSigFieldOrPropType();
        private readSigSerString();
        private readSigElem(type);
    }
    class TableStream {
        public reserved0: number;
        public version: string;
        public heapSizes: number;
        public reserved1: number;
        public tables: any[][];
        public externalTypes: ExternalType[];
        public module: ModuleDefinition;
        public assembly: AssemblyDefinition;
        public read(tableReader: pe.io.BufferReader, streams: MetadataStreams): void;
        private readTableCounts(reader, valid);
        private initTables(reader, tableCounts);
        private initTable(tableIndex, rowCount, TableType);
        private readTables(reader, streams);
    }
    class AssemblyReader {
        public read(reader: pe.io.BufferReader, assembly: AssemblyDefinition): void;
        private populateTypes(mainModule, tables);
        private populateMembers(parentTable, getChildIndex, getChildren, childTable, getChildEntity);
    }
    class AssemblyOS {
        public osplatformID: number;
        public osVersion: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyProcessor {
        public processor: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyRef {
        public definition: AssemblyDefinition;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
        public toString(): string;
    }
    class AssemblyRefOS {
        public definition: AssemblyDefinition;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class AssemblyRefProcessor {
        public processor: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ClassLayout {
        public packingSize: number;
        public classSize: number;
        public parent: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ClrDirectory {
        private static clrHeaderSize;
        public cb: number;
        public runtimeVersion: string;
        public imageFlags: ClrImageFlags;
        public metadataDir: pe.io.AddressRange;
        public entryPointToken: number;
        public resourcesDir: pe.io.AddressRange;
        public strongNameSignatureDir: pe.io.AddressRange;
        public codeManagerTableDir: pe.io.AddressRange;
        public vtableFixupsDir: pe.io.AddressRange;
        public exportAddressTableJumpsDir: pe.io.AddressRange;
        public managedNativeHeaderDir: pe.io.AddressRange;
        public read(clrDirReader: pe.io.BufferReader): void;
    }
    class ClrMetadata {
        public mdSignature: ClrMetadataSignature;
        public metadataVersion: string;
        public runtimeVersion: string;
        public mdReserved: number;
        public mdFlags: number;
        public streamCount: number;
        public read(reader: pe.io.BufferReader): void;
    }
    class Constant {
        public isSingleton: boolean;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class CustomAttribute {
        public parent: any;
        public type: any;
        public value: CustomAttributeData;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class DeclSecurity {
        public action: SecurityAction;
        public parent: any;
        public permissionSet: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class Event {
        public eventFlags: EventAttributes;
        public name: string;
        public eventType: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class EventMap {
        public parent: number;
        public eventList: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ExportedType {
        public flags: TypeAttributes;
        public typeDefId: number;
        public typeName: string;
        public typeNamespace: string;
        public implementation: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldLayout {
        public offset: number;
        public field: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class FieldMarshal {
        public parent: any;
        public nativeType: MarshalSpec;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MarshalSpec {
        public blob: any;
        constructor(blob: any);
    }
    class FieldRVA {
        public rva: number;
        public field: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class File {
        public flags: FileAttributes;
        public name: string;
        public hashValue: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class GenericParam {
        public number: number;
        public flags: GenericParamAttributes;
        public owner: any;
        public name: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class GenericParamConstraint {
        public owner: number;
        public constraint: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ImplMap {
        public mappingFlags: PInvokeAttributes;
        public memberForwarded: any;
        public importName: string;
        public importScope: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class InterfaceImpl {
        public classIndex: number;
        public interface: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class ManifestResource {
        public offset: number;
        public flags: ManifestResourceAttributes;
        public name: string;
        public implementation: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MemberRef {
        public classIndex: any;
        public name: string;
        public signature: MethodSignature;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MetadataStreams {
        public guids: string[];
        public strings: pe.io.AddressRange;
        public blobs: pe.io.AddressRange;
        public tables: pe.io.AddressRange;
        public read(metadataBaseAddress: number, streamCount: number, reader: pe.io.BufferReader): void;
        private readAlignedNameString(reader);
        private readGuidForStream(reader);
    }
    class MethodImpl {
        public classIndex: number;
        public methodBody: any;
        public methodDeclaration: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSemantics {
        public semantics: MethodSemanticsAttributes;
        public method: number;
        public association: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSpec {
        public method: any;
        public instantiation: TypeReference[];
        public internalReadRow(reader: TableStreamReader): void;
    }
    class MethodSpecSig {
        public blob: any;
        constructor(blob: any);
    }
    class ModuleRef {
        public name: string;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class NestedClass {
        public nestedClass: number;
        public enclosingClass: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class PropertyMap {
        public parent: number;
        public propertyList: number;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class StandAloneSig {
        public signatureBlob: any;
        public internalReadRow(reader: TableStreamReader): void;
    }
    class TypeSpec {
        public definition: TypeReference;
        public internalReadRow(reader: TableStreamReader): void;
    }
}
declare module pe.managed2 {
    /**
    * Global environment context for loading assemblies.
    * Avoids singletons.
    */
    class AppDomain {
        public assemblies: Assembly[];
        /**
        * There always have to be mscorlib.
        * It has to exist for many things to work correctly. If one gets loaded later, it will assume the already created identity.
        */
        public mscorlib: Assembly;
        constructor();
        /**
        * Read assembly in AppDomain from a binary stream.
        */
        public read(reader: pe.io.BufferReader): Assembly;
        /**
        * Resolve assembly from already loaded ones.
        * If none exist, create a dummy one and return.
        */
        public resolveAssembly(name: string, version: string, publicKey: string, culture: string): Assembly;
    }
    class Assembly {
        public fileHeaders: pe.headers.PEFileHeaders;
        public name: string;
        public version: string;
        public publicKey: string;
        public culture: string;
        public attributes: metadata.AssemblyFlags;
        /**
        * Assemblies may be created speculatively to represent referenced, but not loaded assemblies.
        * The most common case is mscorlib, which almost always needs to exist, but not necessarily will be loaded first.
        * A speculatively-created assembly can get their true content populated later, if it's loaded properly.
        */
        public isSpeculative: boolean;
        public runtimeVersion: string;
        public specificRuntimeVersion: string;
        public imageFlags: metadata.ClrImageFlags;
        public metadataVersion: string;
        public tableStreamVersion: string;
        public generation: number;
        public moduleName: string;
        public mvid: string;
        public encId: string;
        public encBaseId: string;
        public types: Type[];
        public referencedAssemblies: Assembly[];
        public customAttributes: any[];
        public toString(): string;
    }
    /**
    * Implemented by Type, ConstructedGenericType.
    */
    interface TypeReference {
        getBaseType(): TypeReference;
        getAssembly(): Assembly;
        getFullName(): string;
    }
    /**
    * Represents actual types, as well as referenced types from external libraries that aren't loaded
    * (in which case isSpeculative property is set to true).
    */
    class Type implements TypeReference {
        public baseType: TypeReference;
        public assembly: Assembly;
        public namespace: string;
        public name: string;
        /** If an assembly is loaded, and a type from another assembly is required,
        * but that external assembly is not loaded yet,
        * that assembly and required types in it is created speculatively.
        * IF at any point later that assembly is loaded, it will populate an existing speculative assembly
        * and speculative types, rather than creating new distinct instances.
        */
        public isSpeculative: boolean;
        public attributes: metadata.TypeAttributes;
        public fields: FieldInfo[];
        public methods: MethodInfo[];
        public properties: PropertyInfo[];
        public events: EventInfo[];
        public customAttributes: any;
        constructor(baseType?: TypeReference, assembly?: Assembly, namespace?: string, name?: string);
        public getBaseType(): TypeReference;
        public getAssembly(): Assembly;
        public getFullName(): string;
        public toString(): string;
    }
    class ConstructedGenericType implements TypeReference {
        public genericType: TypeReference;
        public genericArguments: TypeReference[];
        constructor(genericType: TypeReference, genericArguments: TypeReference[]);
        public getBaseType(): TypeReference;
        public getAssembly(): Assembly;
        public getFullName(): string;
        public toString(): string;
    }
    class FieldInfo {
        public attributes: metadata.FieldAttributes;
        public name: string;
        public fieldType: TypeReference;
        public toString(): string;
    }
    class PropertyInfo {
        public name: string;
        public propertyType: TypeReference;
        public getAccessor: MethodInfo;
        public setAccessor: MethodInfo;
    }
    class MethodInfo {
        public name: string;
    }
    class ParameterInfo {
        public name: string;
        public parameterType: TypeReference;
    }
    class EventInfo {
        public name: string;
        public addHandler: MethodInfo;
        public removeHandler: MethodInfo;
    }
    /**
    * All the messy raw CLR structures, with indices, GUIDs etc.
    * This is meant to be exposed from Assembly too (for digging in details when needed),
    * but not prominently.
    */
    class ManagedHeaders {
        public clrDirectory: ClrDirectory;
        public clrMetadata: ClrMetadata;
        public metadataStreams: MetadataStreams;
        public tableStream: TableStream;
    }
    class ClrDirectory {
        private static _clrHeaderSize;
        public cb: number;
        public runtimeVersion: string;
        public imageFlags: metadata.ClrImageFlags;
        public metadataDir: pe.io.AddressRange;
        public entryPointToken: number;
        public resourcesDir: pe.io.AddressRange;
        public strongNameSignatureDir: pe.io.AddressRange;
        public codeManagerTableDir: pe.io.AddressRange;
        public vtableFixupsDir: pe.io.AddressRange;
        public exportAddressTableJumpsDir: pe.io.AddressRange;
        public managedNativeHeaderDir: pe.io.AddressRange;
        public read(readerAtClrDataDirectory: pe.io.BufferReader): void;
    }
    class ClrMetadata {
        public mdSignature: metadata.ClrMetadataSignature;
        public metadataVersion: string;
        public runtimeVersion: string;
        public mdReserved: number;
        public mdFlags: number;
        public streamCount: number;
        public read(clrDirReader: pe.io.BufferReader): void;
    }
    class MetadataStreams {
        public guids: string[];
        public strings: pe.io.AddressRange;
        public blobs: pe.io.AddressRange;
        public tables: pe.io.AddressRange;
        public read(metadataBaseAddress: number, streamCount: number, reader: pe.io.BufferReader): void;
        private _readAlignedNameString(reader);
        private _readGuidForStream(reader);
    }
    class TableStream {
        public reserved0: number;
        public version: string;
        public heapSizes: number;
        public reserved1: number;
        public tables: any[][];
        public stringIndices: string[];
        public allTypes: Type[];
        public allFields: FieldInfo[];
        public allMethods: MethodInfo[];
        public allParameters: ParameterInfo[];
        public read(reader: pe.io.BufferReader, stringCount: number, guidCount: number, blobCount: number): void;
        private _readTableRowCounts(valid, tableReader);
        private _populateApiObjects(tableCounts);
        private _populateTableObjects(table, Ctor, count, apiTable?);
        private _populateTableTypes();
        private _populateTableRows(tableCounts, tableTypes);
        private _readTableRows(tableCounts, tableTypes, reader);
    }
    module metadata {
        enum ClrImageFlags {
            ILOnly = 0x00000001,
            _32BitRequired = 0x00000002,
            ILLibrary = 0x00000004,
            StrongNameSigned = 0x00000008,
            NativeEntryPoint = 0x00000010,
            TrackDebugData = 0x00010000,
            IsIbcoptimized = 0x00020000,
        }
        enum ClrMetadataSignature {
            Signature = 0x424a5342,
        }
        enum AssemblyHashAlgorithm {
            None = 0x0000,
            Reserved = 0x8003,
            Sha1 = 0x8004,
        }
        enum AssemblyFlags {
            PublicKey = 0x0001,
            Retargetable = 0x0100,
            DisableJITcompileOptimizer = 0x4000,
            EnableJITcompileTracking = 0x8000,
        }
        enum ElementType {
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
            Ptr = 0x0f,
            ByRef = 0x10,
            ValueType = 0x11,
            Class = 0x12,
            Var = 0x13,
            Array = 0x14,
            GenericInst = 0x15,
            TypedByRef = 0x16,
            I = 0x18,
            U = 0x19,
            FnPtr = 0x1b,
            Object = 0x1c,
            SZArray = 0x1d,
            MVar = 0x1e,
            CMod_ReqD = 0x1f,
            CMod_Opt = 0x20,
            Internal = 0x21,
            Modifier = 0x40,
            Sentinel,
            Pinned,
            R4_Hfa,
            R8_Hfa,
            ArgumentType_,
            CustomAttribute_BoxedObject_,
            CustomAttribute_Field_,
            CustomAttribute_Property_,
            CustomAttribute_Enum_ = 0x55,
        }
        enum SecurityAction {
            Assert = 3,
            Demand = 2,
            Deny = 4,
            InheritanceDemand = 7,
            LinkDemand = 6,
            NonCasDemand = 0,
            NonCasLinkDemand = 0,
            PrejitGrant = 0,
            PermitOnly = 5,
            RequestMinimum = 8,
            RequestOptional = 9,
            RequestRefuse = 10,
        }
        enum EventAttributes {
            SpecialName = 0x0200,
            RTSpecialName = 0x0400,
        }
        enum TypeAttributes {
            VisibilityMask = 0x00000007,
            NotPublic = 0x00000000,
            Public = 0x00000001,
            NestedPublic = 0x00000002,
            NestedPrivate = 0x00000003,
            NestedFamily = 0x00000004,
            NestedAssembly = 0x00000005,
            NestedFamANDAssem = 0x00000006,
            NestedFamORAssem = 0x00000007,
            LayoutMask = 0x00000018,
            AutoLayout = 0x00000000,
            SequentialLayout = 0x00000008,
            ExplicitLayout = 0x00000010,
            ClassSemanticsMask = 0x00000020,
            Class = 0x00000000,
            Interface = 0x00000020,
            Abstract = 0x00000080,
            Sealed = 0x00000100,
            SpecialName = 0x00000400,
            Import = 0x00001000,
            Serializable = 0x00002000,
            StringFormatMask = 0x00030000,
            AnsiClass = 0x00000000,
            UnicodeClass = 0x00010000,
            AutoClass = 0x00020000,
            CustomFormatClass = 0x00030000,
            CustomStringFormatMask = 0x00C00000,
            BeforeFieldInit = 0x00100000,
            RTSpecialName = 0x00000800,
            HasSecurity = 0x00040000,
            IsTypeForwarder = 0x00200000,
        }
        enum FieldAttributes {
            FieldAccessMask = 0x0007,
            CompilerControlled = 0x0000,
            Private = 0x0001,
            FamANDAssem = 0x0002,
            Assembly = 0x0003,
            Family = 0x0004,
            FamORAssem = 0x0005,
            Public = 0x0006,
            Static = 0x0010,
            InitOnly = 0x0020,
            Literal = 0x0040,
            NotSerialized = 0x0080,
            SpecialName = 0x0200,
            PInvokeImpl = 0x2000,
            RTSpecialName = 0x0400,
            HasFieldMarshal = 0x1000,
            HasDefault = 0x8000,
            HasFieldRVA = 0x0100,
        }
        enum FileAttributes {
            ContainsMetaData = 0x0000,
            ContainsNoMetaData = 0x0001,
        }
        enum GenericParamAttributes {
            VarianceMask = 0x0003,
            None = 0x0000,
            Covariant = 0x0001,
            Contravariant = 0x0002,
            SpecialConstraintMask = 0x001C,
            ReferenceTypeConstraint = 0x0004,
            NotNullableValueTypeConstraint = 0x0008,
            DefaultConstructorConstraint = 0x0010,
        }
        enum PInvokeAttributes {
            NoMangle = 0x0001,
            CharSetMask = 0x0006,
            CharSetNotSpec = 0x0000,
            CharSetAnsi = 0x0002,
            CharSetUnicode = 0x0004,
            CharSetAuto = 0x0006,
            SupportsLastError = 0x0040,
            CallConvMask = 0x0700,
            CallConvPlatformapi = 0x0100,
            CallConvCdecl = 0x0200,
            CallConvStdcall = 0x0300,
            CallConvThiscall = 0x0400,
            CallConvFastcall = 0x0500,
        }
        enum ManifestResourceAttributes {
            VisibilityMask = 0x0007,
            Public = 0x0001,
            Private = 0x0002,
        }
        enum MethodImplAttributes {
            CodeTypeMask = 0x0003,
            IL = 0x0000,
            Native = 0x0001,
            OPTIL = 0x0002,
            Runtime = 0x0003,
            ManagedMask = 0x0004,
            Unmanaged = 0x0004,
            Managed = 0x0000,
            ForwardRef = 0x0010,
            PreserveSig = 0x0080,
            InternalCall = 0x1000,
            Synchronized = 0x0020,
            NoInlining = 0x0008,
            MaxMethodImplVal = 0xffff,
            NoOptimization = 0x0040,
        }
        enum MethodAttributes {
            MemberAccessMask = 0x0007,
            CompilerControlled = 0x0000,
            Private = 0x0001,
            FamANDAssem = 0x0002,
            Assem = 0x0003,
            Family = 0x0004,
            FamORAssem = 0x0005,
            Public = 0x0006,
            Static = 0x0010,
            Final = 0x0020,
            Virtual = 0x0040,
            HideBySig = 0x0080,
            VtableLayoutMask = 0x0100,
            ReuseSlot = 0x0000,
            NewSlot = 0x0100,
            Strict = 0x0200,
            Abstract = 0x0400,
            SpecialName = 0x0800,
            PInvokeImpl = 0x2000,
            UnmanagedExport = 0x0008,
            RTSpecialName = 0x1000,
            HasSecurity = 0x4000,
            RequireSecObject = 0x8000,
        }
        enum MethodSemanticsAttributes {
            Setter = 0x0001,
            Getter = 0x0002,
            Other = 0x0004,
            AddOn = 0x0008,
            RemoveOn = 0x0010,
            Fire = 0x0020,
        }
        enum ParamAttributes {
            In = 0x0001,
            Out = 0x0002,
            Optional = 0x0010,
            HasDefault = 0x1000,
            HasFieldMarshal = 0x2000,
            Unused = 0xcfe0,
        }
        enum PropertyAttributes {
            SpecialName = 0x0200,
            RTSpecialName = 0x0400,
            HasDefault = 0x1000,
            Unused = 0xe9ff,
        }
        enum CallingConventions {
            Default = 0x0,
            C = 0x1,
            StdCall = 0x2,
            FastCall = 0x4,
            VarArg = 0x5,
            Generic = 0x10,
            HasThis = 0x20,
            ExplicitThis = 0x40,
            Sentinel = 0x41,
        }
        enum TableKind {
            ModuleDefinition = 0x00,
            ExternalType = 0x01,
            TypeDefinition = 0x02,
            FieldDefinition = 0x04,
            MethodDefinition = 0x06,
            ParameterDefinition = 0x08,
            MemberRef = 0x0A,
            Constant = 0x0B,
            CustomAttribute = 0x0C,
            FieldMarshal = 0x0D,
            DeclSecurity = 0x0E,
            ClassLayout = 0x0F,
            InterfaceImpl = 0x09,
            FieldLayout = 0x10,
            StandAloneSig = 0x11,
            EventMap = 0x12,
            Event = 0x14,
            PropertyMap = 0x15,
            PropertyDefinition = 0x17,
            MethodSemantics = 0x18,
            MethodImpl = 0x19,
            ModuleRef = 0x1A,
            TypeSpec = 0x1B,
            ImplMap = 0x1C,
            FieldRVA = 0x1D,
            AssemblyDefinition = 0x20,
            AssemblyProcessor = 0x21,
            AssemblyOS = 0x22,
            AssemblyRef = 0x23,
            AssemblyRefProcessor = 0x24,
            AssemblyRefOS = 0x25,
            File = 0x26,
            ExportedType = 0x27,
            ManifestResource = 0x28,
            NestedClass = 0x29,
            GenericParam = 0x2A,
            MethodSpec = 0x2B,
            GenericParamConstraint = 0x2C,
        }
    }
}
