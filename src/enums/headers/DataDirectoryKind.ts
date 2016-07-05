module pe.headers {

  export enum DataDirectoryKind {
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
    Clr = 14
  }

}