module pe.unmanaged {

  export interface DllExports {
    length: number;
    [i: number]: DllExport;

    /** Reserved, must be 0. */
    flags: number;

    /** The time and date that the export data was created. */
    timestamp: Date;

    /** The version number. The major and minor version numbers can be set by the user. */
    version: string;

    /** The ASCII string that contains the name of the DLL. This address is relative to the image base. */
    dllName;

    /**
     * The starting ordinal number for exports in this image.
     * This field specifies the starting ordinal number for the export address table.
     * It is usually set to 1.
     */
    ordinalBase;
  }
}