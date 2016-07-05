module pe.headers{

  export enum ImageCharacteristics {
    /**
     * Relocation information was stripped from the file.
     * The file must be loaded at its preferred base address.
     * If the base address is not available, the loader reports an error.
     */
    RelocsStripped = 0x0001,

    /**
     * The file is executable (there are no unresolved external references).
     */
    ExecutableImage = 0x0002,

    /**
     * COFF line numbers were stripped from the file.
     */
    LineNumsStripped = 0x0004,

    /**
     * COFF symbol table entries were stripped from file.
     */
    LocalSymsStripped = 0x0008,

    /**
     * Aggressively trim the working set.
     * This value is obsolete as of Windows 2000.
     */
    AggressiveWsTrim = 0x0010,

    /**
     * The application can handle addresses larger than 2 GB.
     */
    LargeAddressAware = 0x0020,

    /**
     * The bytes of the word are reversed. This flag is obsolete.
     */
    BytesReversedLo = 0x0080,

    /**
     * The computer supports 32-bit words.
     */
    Bit32Machine = 0x0100,

    /**
     * Debugging information was removed and stored separately in another file.
     */
    DebugStripped = 0x0200,

    /**
     * If the image is on removable media, copy it to and run it from the swap file.
     */
    RemovableRunFromSwap = 0x0400,

    /**
     * If the image is on the network, copy it to and run it from the swap file.
     */
    NetRunFromSwap = 0x0800,

    /**
     * The image is a system file.
     */
    System = 0x1000,

    /**
     * The image is a DLL file.
     * While it is an executable file, it cannot be run directly.
     */
    Dll = 0x2000,

    /**
     * The file should be run only on a uniprocessor computer.
     */
    UpSystemOnly = 0x4000,

    /**
     * The bytes of the word are reversed. This flag is obsolete.
     */
    BytesReversedHi = 0x8000
  }

}