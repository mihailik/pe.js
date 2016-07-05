module pe.headers {

  export enum DllCharacteristics {
    /**
     * Reserved.
     */
    ProcessInit = 0x0001,

    /**
     * Reserved.
     */
    ProcessTerm = 0x0002,

    /**
     * Reserved.
     */
    ThreadInit = 0x0004,

    /**
     * Reserved.
     */
    ThreadTerm = 0x0008,

    /**
     * The DLL can be relocated at load time.
     */
    DynamicBase = 0x0040,


    /**
     * Code integrity checks are forced.
     * If you set this flag and a section contains only uninitialized data,
     * set the PointerToRawData member of IMAGE_SECTION_HEADER
     * for that section to zero;
     * otherwise, the image will fail to load because the digital signature cannot be verified.
     */
    ForceIntegrity = 0x0080,

    /**
     * The image is compatible with data execution prevention (DEP).
     */
    NxCompatible = 0x0100,

    /**
     * The image is isolation aware, but should not be isolated.
     */
    NoIsolation = 0x0200,

    /**
     * The image does not use structured exception handling (SEH). No SE handler may reside in this image.
     */
    NoSEH = 0x0400,

    /**
     * Do not bind this image.
     */
    NoBind = 0x0800,

    /**
     * The image must run inside an AppContainer.
     */
    AppContainer = 0x1000,

    /**
     * WDM (Windows Driver Model) driver.
     */
    WdmDriver = 0x2000,

    /**
     * Reserved (no specific name).
     */
    Reserved = 0x4000,

    /**
     * The image is terminal server aware.
     */
    TerminalServerAware = 0x8000,
  }

 }